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

  // ============ INVITES ============

  // Send an invite to an email
  invite: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        email: z.string().email("Invalid email address"),
        role: z.enum(["viewer", "editor", "admin"]).default("editor"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the board
      const board = await ctx.db.boards.findUnique({
        where: { id: input.boardId },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the board owner can invite people",
        });
      }

      // Can't invite yourself
      if (input.email.toLowerCase() === ctx.user.email.toLowerCase()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't invite yourself",
        });
      }

      // Check if user is already a member
      const existingUser = await ctx.db.users.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        const existingMember = await ctx.db.board_members.findUnique({
          where: {
            board_id_user_id: {
              board_id: input.boardId,
              user_id: existingUser.id,
            },
          },
        });

        if (existingMember) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This user is already a member of this board",
          });
        }
      }

      // Create or update the invite
      const invite = await ctx.db.board_invites.upsert({
        where: {
          board_id_invited_email: {
            board_id: input.boardId,
            invited_email: input.email.toLowerCase(),
          },
        },
        create: {
          board_id: input.boardId,
          invited_email: input.email.toLowerCase(),
          invited_by: ctx.user.id,
          role: input.role,
        },
        update: {
          role: input.role,
          invited_by: ctx.user.id,
        },
      });

      return invite;
    }),

  // Get pending invites for the current user
  pendingInvites: protectedProcedure.query(async ({ ctx }) => {
    const invites = await ctx.db.board_invites.findMany({
      where: {
        invited_email: ctx.user.email.toLowerCase(),
      },
      include: {
        board: {
          include: {
            owner: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return invites.map((invite) => ({
      id: invite.id,
      boardId: invite.board_id,
      boardName: invite.board.name,
      ownerName: invite.board.owner.name ?? invite.board.owner.email,
      role: invite.role,
      createdAt: invite.created_at,
    }));
  }),

  // Accept an invite
  acceptInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.board_invites.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }

      if (invite.invited_email.toLowerCase() !== ctx.user.email.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invite is not for you",
        });
      }

      // Add user as a member
      await ctx.db.board_members.create({
        data: {
          board_id: invite.board_id,
          user_id: ctx.user.id,
          role: invite.role,
        },
      });

      // Delete the invite
      await ctx.db.board_invites.delete({
        where: { id: input.inviteId },
      });

      return { success: true, boardId: invite.board_id };
    }),

  // Decline an invite
  declineInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.board_invites.findUnique({
        where: { id: input.inviteId },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }

      if (invite.invited_email.toLowerCase() !== ctx.user.email.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invite is not for you",
        });
      }

      // Delete the invite
      await ctx.db.board_invites.delete({
        where: { id: input.inviteId },
      });

      return { success: true };
    }),

  // Get board members and pending invites (for board management)
  getBoardMembers: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user owns the board
      const board = await ctx.db.boards.findUnique({
        where: { id: input.boardId },
        include: {
          owner: { select: { id: true, name: true, email: true, avatar_url: true } },
        },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the board owner can view members",
        });
      }

      // Get current members
      const members = await ctx.db.board_members.findMany({
        where: { board_id: input.boardId },
        include: {
          user: { select: { id: true, name: true, email: true, avatar_url: true } },
        },
        orderBy: { joined_at: "asc" },
      });

      // Get pending invites
      const pendingInvites = await ctx.db.board_invites.findMany({
        where: { board_id: input.boardId },
        orderBy: { created_at: "desc" },
      });

      return {
        owner: {
          id: board.owner.id,
          name: board.owner.name,
          email: board.owner.email,
          avatarUrl: board.owner.avatar_url,
          role: "owner" as const,
        },
        members: members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatar_url,
          role: m.role,
          joinedAt: m.joined_at,
        })),
        pendingInvites: pendingInvites.map((inv) => ({
          id: inv.id,
          email: inv.invited_email,
          role: inv.role,
          createdAt: inv.created_at,
        })),
      };
    }),

  // Cancel a pending invite (owner only)
  cancelInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.board_invites.findUnique({
        where: { id: input.inviteId },
        include: { board: true },
      });

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
      }

      if (invite.board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the board owner can cancel invites",
        });
      }

      await ctx.db.board_invites.delete({
        where: { id: input.inviteId },
      });

      return { success: true };
    }),

  // Remove a member from a board (owner only)
  removeMember: protectedProcedure
    .input(z.object({ boardId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.boards.findUnique({
        where: { id: input.boardId },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the board owner can remove members",
        });
      }

      // Can't remove the owner
      if (input.userId === board.owner_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove the board owner",
        });
      }

      await ctx.db.board_members.delete({
        where: {
          board_id_user_id: {
            board_id: input.boardId,
            user_id: input.userId,
          },
        },
      });

      return { success: true };
    }),

  // Update a member's role (owner only)
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        userId: z.string(),
        role: z.enum(["viewer", "editor", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.boards.findUnique({
        where: { id: input.boardId },
      });

      if (!board) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });
      }

      if (board.owner_id !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the board owner can update member roles",
        });
      }

      // Can't change owner's role
      if (input.userId === board.owner_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change the owner's role",
        });
      }

      await ctx.db.board_members.update({
        where: {
          board_id_user_id: {
            board_id: input.boardId,
            user_id: input.userId,
          },
        },
        data: { role: input.role },
      });

      return { success: true };
    }),
});
