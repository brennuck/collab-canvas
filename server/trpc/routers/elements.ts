import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Zod schema for element content based on type
const elementContentSchema = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  endX: z.number().optional(),
  endY: z.number().optional(),
  text: z.string().optional(),
  header: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  strokeWidth: z.number().optional(),
  fill: z.string().optional(),
});

const elementTypeMap = {
  pencil: "freehand",
  line: "connector",
  rectangle: "shape",
  circle: "shape",
  text: "text",
  sticky: "sticky_note",
  card: "sticky_note", // Using sticky_note type for card in DB
} as const;

const dbTypeMap = {
  freehand: "pencil",
  connector: "line",
  shape: "rectangle", // Will need to check content for circle
  text: "text",
  sticky_note: "sticky", // Will check canvasType to distinguish sticky vs card
  image: "image",
} as const;

export const elementsRouter = router({
  // Get all elements for a board (public access for public boards)
  list: publicProcedure.input(z.object({ boardId: z.string() })).query(async ({ ctx, input }) => {
    const userId = ctx.user?.id;

    // Find the board
    const board = await ctx.db.boards.findUnique({
      where: { id: input.boardId },
      include: {
        members: { select: { user_id: true } },
      },
    });

    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
    }

    // Check access: public boards are viewable by anyone
    const isOwner = userId ? board.owner_id === userId : false;
    const isMember = userId ? board.members.some((m) => m.user_id === userId) : false;

    if (!board.is_public && !isOwner && !isMember) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    const elements = await ctx.db.elements.findMany({
      where: { board_id: input.boardId },
      orderBy: { z_index: "asc" },
    });

    // Transform DB elements to canvas format
    return elements.map((el) => {
      const content = el.content as Record<string, unknown>;
      const canvasType = (content.canvasType as string) || dbTypeMap[el.type] || "pencil";

      return {
        id: el.id,
        type: canvasType,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        points: content.points as Array<{ x: number; y: number }> | undefined,
        endX: content.endX as number | undefined,
        endY: content.endY as number | undefined,
        text: content.text as string | undefined,
        header: content.header as string | undefined,
        description: content.description as string | undefined,
        color: (content.color as string) || "#3b82f6",
        strokeWidth: (content.strokeWidth as number) || 4,
        fill: content.fill as string | undefined,
      };
    });
  }),

  // Create a new element
  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        element: z.object({
          id: z.string(),
          type: z.string(),
          x: z.number(),
          y: z.number(),
          width: z.number().optional(),
          height: z.number().optional(),
          points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
          endX: z.number().optional(),
          endY: z.number().optional(),
          text: z.string().optional(),
          header: z.string().optional(),
          description: z.string().optional(),
          color: z.string(),
          strokeWidth: z.number(),
          fill: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has edit access
      const board = await ctx.db.boards.findFirst({
        where: {
          id: input.boardId,
          OR: [
            { owner_id: ctx.user.id },
            { members: { some: { user_id: ctx.user.id, role: { in: ["editor", "admin"] } } } },
          ],
        },
      });

      if (!board) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No edit access" });
      }

      const el = input.element;
      const dbType = elementTypeMap[el.type as keyof typeof elementTypeMap] || "freehand";

      // Get max z_index
      const maxZ = await ctx.db.elements.aggregate({
        where: { board_id: input.boardId },
        _max: { z_index: true },
      });

      const created = await ctx.db.elements.create({
        data: {
          id: el.id,
          board_id: input.boardId,
          type: dbType,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          z_index: (maxZ._max.z_index ?? 0) + 1,
          content: {
            canvasType: el.type, // Store original canvas type
            points: el.points,
            endX: el.endX,
            endY: el.endY,
            text: el.text,
            header: el.header,
            description: el.description,
            color: el.color,
            strokeWidth: el.strokeWidth,
            fill: el.fill,
          },
          created_by: ctx.user.id,
        },
      });

      return created;
    }),

  // Update an element (for moving, etc.)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        boardId: z.string(),
        updates: z.object({
          x: z.number().optional(),
          y: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
          endX: z.number().optional(),
          endY: z.number().optional(),
          text: z.string().optional(),
          header: z.string().optional(),
          description: z.string().optional(),
          color: z.string().optional(),
          strokeWidth: z.number().optional(),
          fill: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has edit access
      const board = await ctx.db.boards.findFirst({
        where: {
          id: input.boardId,
          OR: [
            { owner_id: ctx.user.id },
            { members: { some: { user_id: ctx.user.id, role: { in: ["editor", "admin"] } } } },
          ],
        },
      });

      if (!board) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No edit access" });
      }

      // Get existing element to merge content
      const existing = await ctx.db.elements.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Element not found" });
      }

      const existingContent = existing.content as Record<string, unknown>;
      const { x, y, width, height, ...contentUpdates } = input.updates;

      const updated = await ctx.db.elements.update({
        where: { id: input.id },
        data: {
          x: x ?? existing.x,
          y: y ?? existing.y,
          width: width ?? existing.width,
          height: height ?? existing.height,
          content: {
            ...existingContent,
            ...contentUpdates,
          },
        },
      });

      return updated;
    }),

  // Delete an element
  delete: protectedProcedure
    .input(z.object({ id: z.string(), boardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has edit access
      const board = await ctx.db.boards.findFirst({
        where: {
          id: input.boardId,
          OR: [
            { owner_id: ctx.user.id },
            { members: { some: { user_id: ctx.user.id, role: { in: ["editor", "admin"] } } } },
          ],
        },
      });

      if (!board) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No edit access" });
      }

      await ctx.db.elements.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Batch update elements (for undo/redo, bulk operations)
  batchSync: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        elements: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            x: z.number(),
            y: z.number(),
            width: z.number().optional(),
            height: z.number().optional(),
            points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
            endX: z.number().optional(),
            endY: z.number().optional(),
            text: z.string().optional(),
            header: z.string().optional(),
            description: z.string().optional(),
            color: z.string(),
            strokeWidth: z.number(),
            fill: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has edit access
      const board = await ctx.db.boards.findFirst({
        where: {
          id: input.boardId,
          OR: [
            { owner_id: ctx.user.id },
            { members: { some: { user_id: ctx.user.id, role: { in: ["editor", "admin"] } } } },
          ],
        },
      });

      if (!board) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No edit access" });
      }

      // Delete all existing elements for this board and replace with new set
      await ctx.db.elements.deleteMany({
        where: { board_id: input.boardId },
      });

      // Create all new elements
      if (input.elements.length > 0) {
        await ctx.db.elements.createMany({
          data: input.elements.map((el, index) => ({
            id: el.id,
            board_id: input.boardId,
            type: elementTypeMap[el.type as keyof typeof elementTypeMap] || "freehand",
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            z_index: index,
            content: {
              canvasType: el.type,
              points: el.points,
              endX: el.endX,
              endY: el.endY,
              text: el.text,
              header: el.header,
              description: el.description,
              color: el.color,
              strokeWidth: el.strokeWidth,
              fill: el.fill,
            },
            created_by: ctx.user.id,
          })),
        });
      }

      return { success: true, count: input.elements.length };
    }),
});
