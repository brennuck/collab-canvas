import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const boardsRouter = router({
  // Get all boards for the current user (owned + shared)
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Get user's pinned board IDs
    const pinnedBoardIds = await ctx.db.pinned_boards.findMany({
      where: { user_id: userId },
      select: { board_id: true },
    });
    const pinnedSet = new Set(pinnedBoardIds.map((p) => p.board_id));

    // Get owned boards
    const ownedBoards = await ctx.db.boards.findMany({
      where: { owner_id: userId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { updated_at: "desc" },
    });

    // Get shared boards (where user is a member but not owner)
    const sharedBoards = await ctx.db.boards.findMany({
      where: {
        members: { some: { user_id: userId } },
        NOT: { owner_id: userId },
      },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { members: true } },
      },
      orderBy: { updated_at: "desc" },
    });

    return {
      owned: ownedBoards.map((b) => ({
        id: b.id,
        name: b.name,
        thumbnail: b.thumbnail,
        updatedAt: b.updated_at,
        memberCount: b._count.members + 1, // +1 for owner
        isOwned: true,
        isPinned: pinnedSet.has(b.id),
      })),
      shared: sharedBoards.map((b) => ({
        id: b.id,
        name: b.name,
        thumbnail: b.thumbnail,
        updatedAt: b.updated_at,
        memberCount: b._count.members + 1,
        ownerName: b.owner.name ?? b.owner.email,
        isOwned: false,
        isPinned: pinnedSet.has(b.id),
      })),
    };
  }),

  // Create a new board
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.boards.create({
        data: {
          name: input.name,
          owner_id: ctx.user.id,
        },
      });

      return board;
    }),

  // Rename a board
  rename: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the board
      const board = await ctx.db.boards.findUnique({
        where: { id: input.id },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to rename this board",
        });
      }

      const updated = await ctx.db.boards.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      return updated;
    }),

  // Delete a board
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the board
      const board = await ctx.db.boards.findUnique({
        where: { id: input.id },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this board",
        });
      }

      await ctx.db.boards.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Leave a shared board
  leave: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const membership = await ctx.db.board_members.findUnique({
      where: {
        board_id_user_id: {
          board_id: input.id,
          user_id: ctx.user.id,
        },
      },
    });

    if (!membership) {
      throw new TRPCError({ code: "NOT_FOUND", message: "You are not a member of this board" });
    }

    await ctx.db.board_members.delete({
      where: {
        board_id_user_id: {
          board_id: input.id,
          user_id: ctx.user.id,
        },
      },
    });

    return { success: true };
  }),

  // Pin a board
  pin: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // Verify user has access to this board (owner or member)
    const board = await ctx.db.boards.findFirst({
      where: {
        id: input.id,
        OR: [{ owner_id: ctx.user.id }, { members: { some: { user_id: ctx.user.id } } }],
      },
    });

    if (!board) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
    }

    // Create pin (upsert to avoid duplicates)
    await ctx.db.pinned_boards.upsert({
      where: {
        user_id_board_id: {
          user_id: ctx.user.id,
          board_id: input.id,
        },
      },
      create: {
        user_id: ctx.user.id,
        board_id: input.id,
      },
      update: {}, // No update needed, just ensure it exists
    });

    return { success: true };
  }),

  // Unpin a board
  unpin: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.pinned_boards.deleteMany({
      where: {
        user_id: ctx.user.id,
        board_id: input.id,
      },
    });

    return { success: true };
  }),
});
