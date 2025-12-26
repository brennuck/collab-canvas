import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Users,
  Clock,
  Trash2,
  ExternalLink,
  LogOut,
  Pencil,
  Pin,
  PinOff,
} from "lucide-react";
import type { Board } from "@/types/board";
import { formatRelativeTime } from "@/lib/format";

interface BoardCardProps {
  board: Board;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (board: Board) => void;
  onDelete: (board: Board) => void;
  onLeave: (board: Board) => void;
}

export function BoardCard({ board, onTogglePin, onRename, onDelete, onLeave }: BoardCardProps) {
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

