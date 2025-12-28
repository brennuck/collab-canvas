import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { ConfirmModal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { BoardCard } from "@/components/boards/board-card";
import { CreateBoardModal } from "@/components/boards/create-board-modal";
import { RenameBoardModal } from "@/components/boards/rename-board-modal";
import { InviteModal } from "@/components/boards/invite-modal";
import { ManageMembersModal } from "@/components/boards/manage-members-modal";
import { PendingInvites } from "@/components/boards/pending-invites";
import { getInitials } from "@/lib/format";
import type { Board, OwnedBoardResponse, SharedBoardResponse } from "@/types/board";
import { Plus, Users, FolderOpen, Pin, Loader2 } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Fetch boards
  const { data: boardsData, isLoading } = trpc.boards.list.useQuery();

  // Mutations
  const createBoard = trpc.boards.create.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setCreateModalOpen(false);
    },
  });

  const renameBoard = trpc.boards.rename.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setRenameModal({ open: false, board: null });
    },
  });

  const deleteBoard = trpc.boards.delete.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setDeleteModal({ open: false, board: null });
    },
  });

  const leaveBoard = trpc.boards.leave.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setLeaveModal({ open: false, board: null });
    },
  });

  const pinBoard = trpc.boards.pin.useMutation({
    onSuccess: () => utils.boards.list.invalidate(),
  });

  const unpinBoard = trpc.boards.unpin.useMutation({
    onSuccess: () => utils.boards.list.invalidate(),
  });

  const inviteToBoard = trpc.boards.invite.useMutation({
    onSuccess: () => {
      setInviteModal({ open: false, board: null });
    },
  });

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renameModal, setRenameModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [leaveModal, setLeaveModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [inviteModal, setInviteModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [manageMembersModal, setManageMembersModal] = useState<{
    open: boolean;
    board: Board | null;
  }>({
    open: false,
    board: null,
  });

  // Combine and process boards
  const ownedMapped: Board[] =
    (boardsData?.owned as OwnedBoardResponse[] | undefined)?.map((b) => ({
      id: b.id,
      name: b.name,
      thumbnail: b.thumbnail,
      memberCount: b.memberCount,
      isPinned: b.isPinned,
      isOwned: true,
      updatedAt: new Date(b.updatedAt),
    })) ?? [];

  const sharedMapped: Board[] =
    (boardsData?.shared as SharedBoardResponse[] | undefined)?.map((b) => ({
      id: b.id,
      name: b.name,
      thumbnail: b.thumbnail,
      memberCount: b.memberCount,
      isPinned: b.isPinned,
      ownerName: b.ownerName,
      isOwned: false,
      updatedAt: new Date(b.updatedAt),
    })) ?? [];

  const allBoards: Board[] = [...ownedMapped, ...sharedMapped];

  const pinnedBoards = allBoards.filter((b) => b.isPinned);
  const myBoards = allBoards.filter((b) => b.isOwned && !b.isPinned);
  const sharedBoards = allBoards.filter((b) => !b.isOwned && !b.isPinned);

  const totalOwned = allBoards.filter((b) => b.isOwned).length;
  const totalShared = allBoards.filter((b) => !b.isOwned).length;

  const handleCreateBoard = (name: string, isPublic: boolean) => {
    createBoard.mutate({ name, isPublic });
  };

  const handleRenameBoard = (name: string) => {
    if (!renameModal.board) return;
    renameBoard.mutate({ id: renameModal.board.id, name });
  };

  const handleTogglePin = (id: string, currentlyPinned: boolean) => {
    if (currentlyPinned) {
      unpinBoard.mutate({ id });
    } else {
      pinBoard.mutate({ id });
    }
  };

  const openRenameModal = (board: Board) => {
    setRenameModal({ open: true, board });
  };

  const handleInvite = (email: string, role: "viewer" | "editor" | "admin") => {
    if (!inviteModal.board) return;
    inviteToBoard.mutate({ boardId: inviteModal.board.id, email, role });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-sm font-semibold text-white sm:h-12 sm:w-12">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-[var(--color-text)] sm:text-xl">
                Welcome, {user?.name?.split(" ")[0] ?? "there"}!
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] sm:text-sm">
                {totalOwned} board{totalOwned !== 1 ? "s" : ""} • {totalShared} shared
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] sm:w-auto sm:py-2.5"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>

        {/* Pending Invites - always shown if there are any */}
        <PendingInvites />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedBoards.length > 0 && (
              <section className="mb-8 sm:mb-10">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--color-text)] sm:mb-4 sm:text-lg">
                  <Pin className="h-4 w-4 text-[var(--color-accent)]" />
                  Pinned
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {pinnedBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onTogglePin={handleTogglePin}
                      onRename={openRenameModal}
                      onDelete={(b) => setDeleteModal({ open: true, board: b })}
                      onLeave={(b) => setLeaveModal({ open: true, board: b })}
                      onInvite={(b) => setInviteModal({ open: true, board: b })}
                      onManageMembers={(b) => setManageMembersModal({ open: true, board: b })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* My Boards Section */}
            <section className="mb-8 sm:mb-10">
              <h2 className="mb-3 text-base font-semibold text-[var(--color-text)] sm:mb-4 sm:text-lg">My Boards</h2>

              {totalOwned > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {/* New Board Card */}
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
                  >
                    <div className="rounded-full bg-[var(--color-accent-muted)] p-3">
                      <Plus className="h-6 w-6 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">
                      Create new board
                    </span>
                  </button>

                  {myBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onTogglePin={handleTogglePin}
                      onRename={openRenameModal}
                      onDelete={(b) => setDeleteModal({ open: true, board: b })}
                      onLeave={(b) => setLeaveModal({ open: true, board: b })}
                      onInvite={(b) => setInviteModal({ open: true, board: b })}
                      onManageMembers={(b) => setManageMembersModal({ open: true, board: b })}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="No boards yet"
                  description="Create your first board to start brainstorming, sketching, and collaborating with your team."
                  action={
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                    >
                      <Plus className="h-4 w-4" />
                      Create your first board
                    </button>
                  }
                />
              )}
            </section>

            {/* Shared with Me Section */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-[var(--color-text)] sm:mb-4 sm:text-lg">
                Shared with Me
              </h2>

              {totalShared > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {sharedBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onTogglePin={handleTogglePin}
                      onRename={openRenameModal}
                      onDelete={(b) => setDeleteModal({ open: true, board: b })}
                      onLeave={(b) => setLeaveModal({ open: true, board: b })}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No shared boards"
                  description="When someone invites you to collaborate on their board, it will appear here."
                />
              )}
            </section>
          </>
        )}
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
        isLoading={createBoard.isPending}
      />

      {/* Rename Board Modal */}
      <RenameBoardModal
        isOpen={renameModal.open}
        onClose={() => setRenameModal({ open: false, board: null })}
        onSubmit={handleRenameBoard}
        currentName={renameModal.board?.name ?? ""}
        isLoading={renameBoard.isPending}
      />

      {/* Delete Board Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, board: null })}
        onConfirm={() => deleteModal.board && deleteBoard.mutate({ id: deleteModal.board.id })}
        title="Delete board"
        message={`Are you sure you want to delete "${deleteModal.board?.name}"? This action cannot be undone and all content will be permanently lost.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteBoard.isPending}
      />

      {/* Leave Board Confirmation */}
      <ConfirmModal
        isOpen={leaveModal.open}
        onClose={() => setLeaveModal({ open: false, board: null })}
        onConfirm={() => leaveModal.board && leaveBoard.mutate({ id: leaveModal.board.id })}
        title="Leave board"
        message={`Are you sure you want to leave "${leaveModal.board?.name}"? You'll need a new invite to rejoin.`}
        confirmText="Leave"
        confirmVariant="danger"
        isLoading={leaveBoard.isPending}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={inviteModal.open}
        onClose={() => setInviteModal({ open: false, board: null })}
        onSubmit={handleInvite}
        boardName={inviteModal.board?.name ?? ""}
        boardId={inviteModal.board?.id ?? ""}
        isLoading={inviteToBoard.isPending}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={manageMembersModal.open}
        onClose={() => setManageMembersModal({ open: false, board: null })}
        boardId={manageMembersModal.board?.id ?? ""}
        boardName={manageMembersModal.board?.name ?? ""}
        onInvite={() => {
          setManageMembersModal({ open: false, board: null });
          if (manageMembersModal.board) {
            setInviteModal({ open: true, board: manageMembersModal.board });
          }
        }}
      />
    </div>
  );
}
