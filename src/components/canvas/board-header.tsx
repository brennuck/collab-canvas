import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Settings,
  Wifi,
  WifiOff,
  Menu,
  X,
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
  onlineUserIds?: Set<string>;
  onlineCount?: number;
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
  onDelete,
  onSettings,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isConnected = true,
  isSaving = false,
  onlineUserIds = new Set(),
  onlineCount: externalOnlineCount,
}: BoardHeaderProps) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(boardName);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Check if a member is online
  const isMemberOnline = (memberId: string) => onlineUserIds.has(memberId);

  // Use external online count from socket, or fallback to counting from set
  const onlineCount = externalOnlineCount ?? onlineUserIds.size;

  // Mobile header
  if (isMobile) {
    return (
      <>
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 pt-safe">
          {/* Left: Back + Name */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link
              to="/dashboard"
              className="shrink-0 rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-[var(--color-text)]">
                {boardName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 text-emerald-500" />
                    {isSaving && <span>Saving...</span>}
                    {!isSaving && onlineCount > 1 && <span>{onlineCount} online</span>}
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-amber-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Undo/Redo */}
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)] disabled:opacity-40"
                aria-label="Undo"
              >
                <Undo2 className="h-5 w-5" />
              </button>
            )}
            {onRedo && (
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)] disabled:opacity-40"
                aria-label="Redo"
              >
                <Redo2 className="h-5 w-5" />
              </button>
            )}

            {/* Menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)]"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Mobile menu sheet */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-x-0 top-0 z-50 animate-slide-down rounded-b-2xl border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] pt-safe shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Zoom controls */}
              <div className="border-b border-[var(--color-border)] p-4">
                <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Zoom
                </span>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={onZoomOut}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] active:bg-[var(--color-accent-muted)]"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onZoomReset}
                    className="min-w-[4rem] rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-center text-sm font-medium text-[var(--color-text)]"
                  >
                    {zoom}%
                  </button>
                  <button
                    onClick={onZoomIn}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] active:bg-[var(--color-accent-muted)]"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="border-b border-[var(--color-border)] p-4">
                <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Collaborators ({members.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {members.slice(0, 8).map((member) => {
                    const isOnline = isMemberOnline(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white ${
                          isOnline
                            ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)]"
                            : "bg-[var(--color-text-muted)]/50"
                        }`}
                        title={member.name ?? member.email}
                      >
                        {getInitials(member.name, member.email)}
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-surface-elevated)] bg-emerald-500" />
                        )}
                      </div>
                    );
                  })}
                  {members.length > 8 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)]">
                      +{members.length - 8}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  {onShare && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onShare();
                      }}
                      className="flex items-center gap-3 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white"
                    >
                      <Share2 className="h-5 w-5" />
                      Share Board
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-sm text-[var(--color-text)]"
                  >
                    <Copy className="h-5 w-5 text-[var(--color-text-muted)]" />
                    Copy Link
                  </button>

                  {userRole === "owner" && onSettings && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSettings();
                      }}
                      className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-sm text-[var(--color-text)]"
                    >
                      <Settings className="h-5 w-5 text-[var(--color-text-muted)]" />
                      Board Settings
                    </button>
                  )}

                  {userRole === "owner" && onDelete && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onDelete();
                      }}
                      className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Board
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop header (original)
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
          {members.slice(0, 5).map((member, i) => {
            const isOnline = isMemberOnline(member.id);
            return (
              <div
                key={member.id}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] text-[10px] font-semibold text-white ${
                  isOnline
                    ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)]"
                    : "bg-[var(--color-text-muted)]/50"
                }`}
                style={{ zIndex: members.length - i }}
                title={`${member.name ?? member.email}${isOnline ? " (online)" : " (offline)"}`}
              >
                {getInitials(member.name, member.email)}
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface-elevated)] bg-emerald-500" />
                )}
              </div>
            );
          })}
          {members.length > 5 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-[var(--color-surface-hover)] text-[10px] font-semibold text-[var(--color-text-muted)]">
              +{members.length - 5}
            </div>
          )}
        </div>

        {/* Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            title="Share this board"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        )}

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
