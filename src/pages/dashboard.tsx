import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import {
  Plus,
  MoreHorizontal,
  Users,
  Clock,
  Trash2,
  ExternalLink,
  LogOut,
  Pencil,
  FolderOpen,
  Pin,
  PinOff,
  Loader2,
} from "lucide-react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface Board {
  id: string;
  name: string;
  updatedAt: Date;
  memberCount: number;
  thumbnail: string | null;
  ownerName?: string;
  isOwned: boolean;
  isPinned: boolean;
}

// API response types (mirror of tRPC output)
interface OwnedBoardResponse {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: Date;
  memberCount: number;
  isOwned: boolean;
  isPinned: boolean;
}

interface SharedBoardResponse {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: Date;
  memberCount: number;
  ownerName: string;
  isOwned: boolean;
  isPinned: boolean;
}

function BoardCard({
  board,
  onTogglePin,
  onRename,
  onDelete,
  onLeave,
}: {
  board: Board;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (board: Board) => void;
  onDelete: (board: Board) => void;
  onLeave: (board: Board) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="hover:border-[var(--color-text-muted)]/30 group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-all">
      {/* Pin indicator */}
      {board.isPinned && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-[var(--color-surface-elevated)] p-1.5 shadow-md">
          <Pin className="h-3 w-3 text-[var(--color-accent)]" />
        </div>
      )}

      {/* Thumbnail / Preview */}
      <Link to={`/board/${board.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-[var(--color-surface)]">
          {/* Grid pattern placeholder */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
          {/* Decorative elements to hint at content */}
          <div className="absolute left-[10%] top-[15%] h-8 w-16 rotate-[-2deg] rounded bg-amber-400/20" />
          <div className="absolute right-[15%] top-[25%] h-6 w-12 rotate-[3deg] rounded bg-pink-400/20" />
          <div className="bg-[var(--color-accent)]/30 absolute bottom-[20%] left-[20%] h-1 w-24 rounded-full" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link
            to={`/board/${board.id}`}
            className="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            {board.name}
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-[var(--color-text-muted)] opacity-0 transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-xl">
                  <Link
                    to={`/board/${board.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Link>
                  <button
                    onClick={() => {
                      onTogglePin(board.id, board.isPinned);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                  >
                    {board.isPinned ? (
                      <>
                        <PinOff className="h-4 w-4" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4" />
                        Pin to top
                      </>
                    )}
                  </button>
                  {board.isOwned ? (
                    <>
                      <button
                        onClick={() => {
                          onRename(board);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                      >
                        <Pencil className="h-4 w-4" />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          onDelete(board);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-surface-hover)]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onLeave(board);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-surface-hover)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Leave board
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          {!board.isOwned && board.ownerName && (
            <span className="flex items-center gap-1">by {board.ownerName}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(board.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {board.memberCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-[var(--color-surface-elevated)]/50 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-[var(--color-accent-muted)] p-4">
        <Icon className="h-8 w-8 text-[var(--color-accent)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action}
    </div>
  );
}

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
      setNewBoardName("");
    },
  });

  const renameBoard = trpc.boards.rename.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setRenameModal({ open: false, board: null });
      setRenameValue("");
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

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [renameModal, setRenameModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [renameValue, setRenameValue] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [leaveModal, setLeaveModal] = useState<{ open: boolean; board: Board | null }>({
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

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() ?? "??";
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    createBoard.mutate({ name: newBoardName.trim() });
  };

  const handleRenameBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameModal.board || !renameValue.trim()) return;
    renameBoard.mutate({ id: renameModal.board.id, name: renameValue.trim() });
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
    setRenameValue(board.name);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
              {getInitials(user?.name, user?.email)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                Welcome back, {user?.name?.split(" ")[0] ?? "there"}!
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                {totalOwned} board{totalOwned !== 1 ? "s" : ""} • {totalShared} shared with you
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedBoards.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
                  <Pin className="h-4 w-4 text-[var(--color-accent)]" />
                  Pinned
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedBoards.map((board) => (
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
              </section>
            )}

            {/* My Boards Section */}
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">My Boards</h2>

              {totalOwned > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* New Board Card */}
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[var(--color-surface-elevated)]/50 flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
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
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Shared with Me
              </h2>

              {totalShared > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create new board"
      >
        <form onSubmit={handleCreateBoard}>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Board name
          </label>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="e.g., Project Brainstorm"
            autoFocus
            className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newBoardName.trim() || createBoard.isPending}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {createBoard.isPending ? "Creating..." : "Create board"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rename Board Modal */}
      <Modal
        isOpen={renameModal.open}
        onClose={() => setRenameModal({ open: false, board: null })}
        title="Rename board"
      >
        <form onSubmit={handleRenameBoard}>
          <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
            Board name
          </label>
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRenameModal({ open: false, board: null })}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!renameValue.trim() || renameBoard.isPending}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {renameBoard.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

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
    </div>
  );
}
