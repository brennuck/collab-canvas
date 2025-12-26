import { useState, useRef, useEffect } from "react";
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
  Check,
  Pencil,
  Download,
  Trash2,
  Copy,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isOnline?: boolean;
}

interface BoardHeaderProps {
  boardName: string;
  userRole: string;
  members: Member[];
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onRename?: (name: string) => void;
  onShare?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isConnected?: boolean;
  isSaving?: boolean;
}

export function BoardHeader({
  boardName,
  userRole,
  members,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onRename,
  onShare,
  onExport,
  onDelete,
  onSettings,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isConnected = true,
  isSaving = false,
}: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(boardName);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameSubmit = () => {
    if (editValue.trim() && editValue !== boardName) {
      onRename?.(editValue.trim());
    } else {
      setEditValue(boardName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditValue(boardName);
      setIsEditing(false);
    }
  };

  // Get online members count
  const onlineCount = members.filter((m) => m.isOnline !== false).length;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3">
      {/* Left: Back + Board Name */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="h-4 w-px bg-[var(--color-border)]" />

        {/* Board Name - Editable */}
        {isEditing && userRole === "owner" ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="w-48 rounded-md border border-[var(--color-accent)] bg-[var(--color-surface)] px-2 py-0.5 text-sm font-semibold text-[var(--color-text)] outline-none ring-1 ring-[var(--color-accent)]"
          />
        ) : (
          <button
            onClick={() => userRole === "owner" && setIsEditing(true)}
            className={`group flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-semibold text-[var(--color-text)] ${
              userRole === "owner" ? "hover:bg-[var(--color-surface-hover)]" : ""
            }`}
            title={userRole === "owner" ? "Click to rename" : boardName}
          >
            {boardName}
            {userRole === "owner" && (
              <Pencil className="h-3 w-3 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        )}

        {/* Role Badge */}
        {userRole !== "owner" && (
          <span className="rounded bg-[var(--color-surface-hover)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
            {userRole}
          </span>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <div className="flex items-center gap-1 text-xs text-emerald-500" title="Connected">
              <Wifi className="h-3 w-3" />
              {isSaving && <span className="text-[var(--color-text-muted)]">Saving...</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-500" title="Reconnecting...">
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Undo/Redo + Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-4 w-px bg-[var(--color-border)]" />

        <button
          onClick={onZoomOut}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Zoom out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="min-w-[3rem] rounded px-1 py-0.5 text-center text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)]"
          title="Reset zoom to 100%"
        >
          {zoom}%
        </button>
        <button
          onClick={onZoomIn}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Zoom in (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Members + Actions */}
      <div className="flex items-center gap-2">
        {/* Online Indicator */}
        {onlineCount > 1 && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {onlineCount} online
          </div>
        )}

        {/* Member Avatars */}
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((member, i) => (
            <div
              key={member.id}
              className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-[10px] font-semibold text-white"
              style={{ zIndex: members.length - i }}
              title={`${member.name ?? member.email}${member.isOnline !== false ? " (online)" : ""}`}
            >
              {getInitials(member.name, member.email)}
              {member.isOnline !== false && (
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface-elevated)] bg-emerald-500" />
              )}
            </div>
          ))}
          {members.length > 5 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-[var(--color-surface-hover)] text-[10px] font-semibold text-[var(--color-text-muted)]">
              +{members.length - 5}
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          title="Share this board"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-xl">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                >
                  <Copy className="h-4 w-4" />
                  Copy link
                </button>
                {userRole === "owner" && (
                  <>
                    <div className="my-1 h-px bg-[var(--color-border)]" />
                    <button
                      onClick={() => {
                        onSettings?.();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      <Settings className="h-4 w-4" />
                      Board settings
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--color-surface-hover)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete board
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
