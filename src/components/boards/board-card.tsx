import { useState, useMemo } from "react";
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
  UserPlus,
  Settings,
} from "lucide-react";
import type { Board } from "@/types/board";
import { formatRelativeTime } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";

const cardBackgrounds = [
  // 1. Aurora - Purple/teal gradient with floating orbs
  {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    elements: [
      { type: "circle", x: "15%", y: "20%", size: 60, color: "rgba(147, 51, 234, 0.3)", blur: 20 },
      { type: "circle", x: "75%", y: "60%", size: 80, color: "rgba(6, 182, 212, 0.25)", blur: 25 },
      { type: "circle", x: "50%", y: "30%", size: 40, color: "rgba(236, 72, 153, 0.2)", blur: 15 },
    ],
  },
  // 2. Sunset mesh - Warm orange/pink
  {
    background: "linear-gradient(160deg, #1f1f1f 0%, #2d1f1f 50%, #1f1a1f 100%)",
    elements: [
      {
        type: "circle",
        x: "20%",
        y: "30%",
        size: 100,
        color: "rgba(251, 146, 60, 0.25)",
        blur: 30,
      },
      { type: "circle", x: "80%", y: "20%", size: 70, color: "rgba(244, 63, 94, 0.2)", blur: 25 },
      { type: "circle", x: "60%", y: "70%", size: 50, color: "rgba(253, 186, 116, 0.2)", blur: 20 },
    ],
  },
  // 3. Ocean depth - Deep blue/cyan
  {
    background: "linear-gradient(180deg, #0c1222 0%, #0a1628 50%, #0f172a 100%)",
    elements: [
      { type: "circle", x: "30%", y: "40%", size: 90, color: "rgba(56, 189, 248, 0.2)", blur: 30 },
      { type: "circle", x: "70%", y: "25%", size: 60, color: "rgba(34, 211, 238, 0.15)", blur: 20 },
      { type: "wave", y: "80%", color: "rgba(56, 189, 248, 0.1)" },
    ],
  },
  // 4. Forest - Green/emerald
  {
    background: "linear-gradient(145deg, #0f1f1a 0%, #1a2f25 50%, #0f261c 100%)",
    elements: [
      { type: "circle", x: "25%", y: "35%", size: 70, color: "rgba(52, 211, 153, 0.2)", blur: 25 },
      { type: "circle", x: "65%", y: "55%", size: 90, color: "rgba(16, 185, 129, 0.15)", blur: 30 },
      {
        type: "circle",
        x: "80%",
        y: "20%",
        size: 40,
        color: "rgba(167, 243, 208, 0.15)",
        blur: 15,
      },
    ],
  },
  // 5. Lavender dreams - Purple/violet
  {
    background: "linear-gradient(135deg, #1a1625 0%, #251a35 50%, #1f1a2e 100%)",
    elements: [
      {
        type: "circle",
        x: "20%",
        y: "25%",
        size: 80,
        color: "rgba(167, 139, 250, 0.25)",
        blur: 25,
      },
      { type: "circle", x: "75%", y: "45%", size: 60, color: "rgba(192, 132, 252, 0.2)", blur: 20 },
      { type: "circle", x: "45%", y: "70%", size: 50, color: "rgba(139, 92, 246, 0.15)", blur: 18 },
    ],
  },
  // 6. Coral reef - Pink/coral
  {
    background: "linear-gradient(150deg, #1f1a1f 0%, #2a1f25 50%, #1f1a20 100%)",
    elements: [
      {
        type: "circle",
        x: "30%",
        y: "30%",
        size: 75,
        color: "rgba(251, 113, 133, 0.25)",
        blur: 25,
      },
      { type: "circle", x: "70%", y: "50%", size: 55, color: "rgba(253, 164, 175, 0.2)", blur: 20 },
      {
        type: "circle",
        x: "50%",
        y: "75%",
        size: 65,
        color: "rgba(244, 114, 182, 0.15)",
        blur: 22,
      },
    ],
  },
  // 7. Midnight - Dark with blue accents
  {
    background: "linear-gradient(135deg, #0f0f1a 0%, #151525 50%, #1a1a2a 100%)",
    elements: [
      {
        type: "circle",
        x: "15%",
        y: "60%",
        size: 100,
        color: "rgba(99, 102, 241, 0.15)",
        blur: 35,
      },
      {
        type: "circle",
        x: "85%",
        y: "30%",
        size: 70,
        color: "rgba(129, 140, 248, 0.12)",
        blur: 25,
      },
      { type: "grid", color: "rgba(99, 102, 241, 0.05)" },
    ],
  },
  // 8. Golden hour - Amber/yellow
  {
    background: "linear-gradient(160deg, #1a1814 0%, #252015 50%, #1f1c14 100%)",
    elements: [
      { type: "circle", x: "25%", y: "35%", size: 85, color: "rgba(251, 191, 36, 0.2)", blur: 28 },
      { type: "circle", x: "70%", y: "25%", size: 60, color: "rgba(252, 211, 77, 0.15)", blur: 22 },
      { type: "circle", x: "55%", y: "65%", size: 45, color: "rgba(245, 158, 11, 0.18)", blur: 18 },
    ],
  },
  // 9. Northern lights - Multi-color
  {
    background: "linear-gradient(135deg, #0f1419 0%, #1a1f25 50%, #0f1922 100%)",
    elements: [
      { type: "circle", x: "20%", y: "40%", size: 70, color: "rgba(52, 211, 153, 0.2)", blur: 25 },
      { type: "circle", x: "50%", y: "20%", size: 60, color: "rgba(147, 51, 234, 0.18)", blur: 22 },
      { type: "circle", x: "80%", y: "55%", size: 55, color: "rgba(56, 189, 248, 0.15)", blur: 20 },
    ],
  },
  // 10. Monochrome - Elegant grayscale
  {
    background: "linear-gradient(145deg, #18181b 0%, #1f1f23 50%, #18181b 100%)",
    elements: [
      {
        type: "circle",
        x: "30%",
        y: "30%",
        size: 90,
        color: "rgba(255, 255, 255, 0.04)",
        blur: 30,
      },
      {
        type: "circle",
        x: "70%",
        y: "60%",
        size: 70,
        color: "rgba(255, 255, 255, 0.03)",
        blur: 25,
      },
      { type: "grid", color: "rgba(255, 255, 255, 0.02)" },
    ],
  },
];

// Simple hash function to get consistent index from board ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

interface BackgroundElement {
  type: string;
  x?: string;
  y?: string;
  size?: number;
  color: string;
  blur?: number;
}

interface BoardCardProps {
  board: Board;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onRename: (board: Board) => void;
  onDelete: (board: Board) => void;
  onLeave: (board: Board) => void;
  onInvite?: (board: Board) => void;
  onManageMembers?: (board: Board) => void;
}

export function BoardCard({
  board,
  onTogglePin,
  onRename,
  onDelete,
  onLeave,
  onInvite,
  onManageMembers,
}: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get consistent background based on board ID
  const bgStyle = useMemo(() => {
    const index = hashString(board.id) % cardBackgrounds.length;
    return cardBackgrounds[index];
  }, [board.id]);

  return (
    <div className="hover:border-[var(--color-text-muted)]/30 group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-all hover:shadow-lg hover:shadow-black/20">
      {/* Pin indicator */}
      {board.isPinned && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-[var(--color-surface-elevated)] p-1.5 shadow-md">
          <Pin className="h-3 w-3 text-[var(--color-accent)]" />
        </div>
      )}

      {/* Thumbnail / Preview */}
      <Link to={`/board/${board.id}`} className="block">
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-t-xl"
          style={{ background: bgStyle?.background }}
        >
          {/* Render decorative elements - scale down on mobile */}
          {bgStyle?.elements.map((el: BackgroundElement, i: number) => {
            const scale = isMobile ? 0.6 : 1;
            if (el.type === "circle") {
              const scaledSize = (el.size ?? 50) * scale;
              const scaledBlur = (el.blur ?? 20) * scale;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: scaledSize,
                    height: scaledSize,
                    backgroundColor: el.color,
                    filter: `blur(${scaledBlur}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              );
            }
            if (el.type === "grid") {
              const gridSize = isMobile ? 16 : 24;
              return (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(${el.color} 1px, transparent 1px),
                      linear-gradient(90deg, ${el.color} 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                  }}
                />
              );
            }
            if (el.type === "wave") {
              return (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    top: el.y,
                    height: isMobile ? 5 : 8,
                    background: `linear-gradient(0deg, ${el.color} 0%, transparent 100%)`,
                  }}
                />
              );
            }
            return null;
          })}

          {/* Subtle grid overlay for depth */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: isMobile ? "14px 14px" : "20px 20px",
            }}
          />

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/5" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link
            to={`/board/${board.id}`}
            className="line-clamp-2 text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] sm:text-base"
          >
            {board.name}
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] sm:p-1 ${
                isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />
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
                      {onInvite && (
                        <button
                          onClick={() => {
                            onInvite(board);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                        >
                          <UserPlus className="h-4 w-4" />
                          Invite
                        </button>
                      )}
                      {onManageMembers && (
                        <button
                          onClick={() => {
                            onManageMembers(board);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                        >
                          <Settings className="h-4 w-4" />
                          Manage Members
                        </button>
                      )}
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
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-text-muted)] sm:gap-3 sm:text-xs">
          {!board.isOwned && board.ownerName && (
            <span className="flex items-center gap-1 truncate">by {board.ownerName}</span>
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
