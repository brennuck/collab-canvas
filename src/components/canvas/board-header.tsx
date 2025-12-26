import { Link } from "react-router-dom";
import { getInitials } from "@/lib/format";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Share2,
  MoreHorizontal,
} from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface BoardHeaderProps {
  boardName: string;
  userRole: string;
  members: Member[];
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function BoardHeader({
  boardName,
  userRole,
  members,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: BoardHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3">
      {/* Left: Back + Board Name */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-4 w-px bg-[var(--color-border)]" />
        <h1 className="text-sm font-semibold text-[var(--color-text)]">{boardName}</h1>
        {userRole !== "owner" && (
          <span className="rounded bg-[var(--color-surface-hover)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
            {userRole}
          </span>
        )}
      </div>

      {/* Center: Undo/Redo + Zoom */}
      <div className="flex items-center gap-1">
        <button
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-40"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-4 w-px bg-[var(--color-border)]" />

        <button
          onClick={onZoomOut}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="min-w-[3rem] rounded px-1 py-0.5 text-center text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)]"
          title="Reset zoom"
        >
          {zoom}%
        </button>
        <button
          onClick={onZoomIn}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Members + Actions */}
      <div className="flex items-center gap-2">
        {/* Member Avatars */}
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member, i) => (
            <div
              key={member.id}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-[10px] font-semibold text-white"
              style={{ zIndex: members.length - i }}
              title={member.name ?? member.email}
            >
              {getInitials(member.name, member.email)}
            </div>
          ))}
          {members.length > 5 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-[var(--color-surface-hover)] text-[10px] font-semibold text-[var(--color-text-muted)]">
              +{members.length - 5}
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>

        <button
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

