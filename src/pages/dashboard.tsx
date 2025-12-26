import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";

// Mock data - will be replaced with tRPC queries
const initialMockBoards = [
  {
    id: "1",
    name: "Product Roadmap Q1",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    memberCount: 4,
    thumbnail: null,
    isOwned: true,
    isPinned: true,
  },
  {
    id: "2",
    name: "User Research Findings",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    memberCount: 2,
    thumbnail: null,
    isOwned: true,
    isPinned: false,
  },
  {
    id: "3",
    name: "Sprint Planning",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    memberCount: 6,
    thumbnail: null,
    isOwned: true,
    isPinned: false,
  },
  {
    id: "4",
    name: "Design System",
    ownerName: "Sarah Chen",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    memberCount: 8,
    thumbnail: null,
    isOwned: false,
    isPinned: true,
  },
  {
    id: "5",
    name: "Q4 Marketing Campaign",
    ownerName: "Alex Kim",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    memberCount: 5,
    thumbnail: null,
    isOwned: false,
    isPinned: false,
  },
];

// Placeholder - Toggle this to test empty states
const USE_MOCK_DATA = true;

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

function BoardCard({
  board,
  onTogglePin,
}: {
  board: Board;
  onTogglePin: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-all hover:border-[var(--color-text-muted)]/30">
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
          <div className="absolute bottom-[20%] left-[20%] h-1 w-24 rounded-full bg-[var(--color-accent)]/30" />
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
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
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
                      onTogglePin(board.id);
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
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]">
                        <Pencil className="h-4 w-4" />
                        Rename
                      </button>
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-surface-hover)]">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  ) : (
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-surface-hover)]">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 px-6 py-12 text-center">
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

  // Local state for boards (will be replaced with tRPC)
  const [boards, setBoards] = useState<Board[]>(USE_MOCK_DATA ? initialMockBoards : []);

  const togglePin = (id: string) => {
    setBoards((prev) =>
      prev.map((board) => (board.id === id ? { ...board, isPinned: !board.isPinned } : board))
    );
  };

  // Filter boards into categories
  const pinnedBoards = boards.filter((b) => b.isPinned);
  const myBoards = boards.filter((b) => b.isOwned && !b.isPinned);
  const sharedBoards = boards.filter((b) => !b.isOwned && !b.isPinned);

  const totalOwned = boards.filter((b) => b.isOwned).length;
  const totalShared = boards.filter((b) => !b.isOwned).length;

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

          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>

        {/* Pinned Section */}
        {pinnedBoards.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
              <Pin className="h-4 w-4 text-[var(--color-accent)]" />
              Pinned
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pinnedBoards.map((board) => (
                <BoardCard key={board.id} board={board} onTogglePin={togglePin} />
              ))}
            </div>
          </section>
        )}

        {/* My Boards Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">My Boards</h2>

          {myBoards.length > 0 || pinnedBoards.some((b) => b.isOwned) ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* New Board Card */}
              <button className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]">
                <div className="rounded-full bg-[var(--color-accent-muted)] p-3">
                  <Plus className="h-6 w-6 text-[var(--color-accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  Create new board
                </span>
              </button>

              {myBoards.map((board) => (
                <BoardCard key={board.id} board={board} onTogglePin={togglePin} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No boards yet"
              description="Create your first board to start brainstorming, sketching, and collaborating with your team."
              action={
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
                  <Plus className="h-4 w-4" />
                  Create your first board
                </button>
              }
            />
          )}
        </section>

        {/* Shared with Me Section */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Shared with Me</h2>

          {sharedBoards.length > 0 || pinnedBoards.some((b) => !b.isOwned) ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sharedBoards.map((board) => (
                <BoardCard key={board.id} board={board} onTogglePin={togglePin} />
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
      </div>
    </div>
  );
}
