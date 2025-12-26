import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useLiveCursors } from "@/hooks/use-live-cursors";
import { Canvas, type Tool, type CanvasRef } from "@/components/canvas/canvas";
import { ToolsSidebar, tools } from "@/components/canvas/tools-sidebar";
import { BoardHeader } from "@/components/canvas/board-header";
import { StyleToolbar } from "@/components/canvas/style-toolbar";
import { LiveCursors } from "@/components/canvas/live-cursors";
import { InviteModal } from "@/components/boards/invite-modal";
import { BoardSettingsModal } from "@/components/boards/board-settings-modal";
import { ConfirmModal } from "@/components/ui/modal";
import { ArrowLeft, Loader2, Lock, LogIn } from "lucide-react";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const canvasRef = useRef<CanvasRef>(null);
  const { user } = useAuth();

  // Canvas state
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [zoom, setZoom] = useState(100);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(4);

  // History state (synced from canvas ref)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Canvas offset for live cursors (updated from ref)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Live cursors
  const { cursors, updateCursor, isConnected } = useLiveCursors({
    boardId: id || "",
    userId: user?.id || null,
    userName: user?.name || user?.email || "Anonymous",
    enabled: !!id,
  });

  // Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const {
    data: board,
    isLoading,
    error,
  } = trpc.boards.get.useQuery({ id: id! }, { enabled: !!id });

  // Mutations
  const renameBoard = trpc.boards.rename.useMutation({
    onSuccess: () => {
      utils.boards.get.invalidate({ id: id! });
    },
  });

  const deleteBoard = trpc.boards.delete.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  const inviteToBoard = trpc.boards.invite.useMutation({
    onSuccess: () => {
      setShareModalOpen(false);
      utils.boards.get.invalidate({ id: id! });
    },
  });

  const updateSettings = trpc.boards.updateSettings.useMutation({
    onSuccess: () => {
      setSettingsModalOpen(false);
      utils.boards.get.invalidate({ id: id! });
    },
  });

  // Sync history state and offset from canvas ref
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        setCanUndo(canvasRef.current.canUndo);
        setCanRedo(canvasRef.current.canRedo);
        setCanvasOffset(canvasRef.current.offset);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Undo: Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      canvasRef.current?.undo();
      return;
    }

    // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
    if (
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
      ((e.ctrlKey || e.metaKey) && e.key === "y")
    ) {
      e.preventDefault();
      canvasRef.current?.redo();
      return;
    }

    // Tool shortcuts
    const key = e.key.toLowerCase();
    const tool = tools.find((t) => t.shortcut?.toLowerCase() === key);
    if (tool) {
      setActiveTool(tool.id);
    }
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-surface)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (error || !board) {
    const isUnauthorized = error?.data?.code === "UNAUTHORIZED";
    const isForbidden = error?.data?.code === "FORBIDDEN";

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface)] px-4">
        <div className="rounded-full bg-[var(--color-surface-elevated)] p-4">
          {isUnauthorized ? (
            <LogIn className="h-8 w-8 text-[var(--color-accent)]" />
          ) : isForbidden ? (
            <Lock className="h-8 w-8 text-amber-500" />
          ) : (
            <ArrowLeft className="h-8 w-8 text-[var(--color-text-muted)]" />
          )}
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">
            {isUnauthorized
              ? "Sign in required"
              : isForbidden
                ? "Private board"
                : "Board not found"}
          </h2>
          <p className="max-w-md text-[var(--color-text-muted)]">
            {isUnauthorized
              ? "This board requires you to sign in to view it."
              : isForbidden
                ? "This board is private. You need an invite from the owner to access it."
                : "The board you're looking for doesn't exist or may have been deleted."}
          </p>
        </div>
        <div className="flex gap-3">
          {isUnauthorized ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                Go home
              </Link>
            </>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go home
            </button>
          )}
        </div>
      </div>
    );
  }

  const allMembers = [
    { ...board.owner, role: "owner" as const, isOnline: true },
    ...board.members.map((m) => ({ ...m, isOnline: true })),
  ];

  // Check if user can edit (not a viewer)
  const canEdit = board.userRole !== "viewer";

  const handleRename = (name: string) => {
    if (!canEdit) return;
    renameBoard.mutate({ id: id!, name });
  };

  const handleInvite = (email: string, role: "viewer" | "editor" | "admin") => {
    inviteToBoard.mutate({ boardId: id!, email, role });
  };

  const handleDelete = () => {
    deleteBoard.mutate({ id: id! });
  };

  const handleUpdateSettings = (isPublic: boolean) => {
    updateSettings.mutate({ id: id!, isPublic });
  };

  return (
    <div
      className="flex h-screen flex-col bg-[var(--color-surface)]"
      onKeyDown={canEdit ? handleKeyDown : undefined}
      tabIndex={0}
    >
      <BoardHeader
        boardName={board.name}
        userRole={board.userRole}
        members={allMembers}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(400, z + 25))}
        onZoomOut={() => setZoom((z) => Math.max(25, z - 25))}
        onZoomReset={() => setZoom(100)}
        onRename={canEdit ? handleRename : undefined}
        onShare={board.isOwner ? () => setShareModalOpen(true) : undefined}
        onDelete={board.isOwner ? () => setDeleteModalOpen(true) : undefined}
        onSettings={board.isOwner ? () => setSettingsModalOpen(true) : undefined}
        canUndo={canEdit ? canUndo : false}
        canRedo={canEdit ? canRedo : false}
        onUndo={canEdit ? handleUndo : undefined}
        onRedo={canEdit ? handleRedo : undefined}
        isConnected={isConnected}
        isSaving={isSaving || renameBoard.isPending}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Only show tools sidebar if user can edit */}
        {canEdit && <ToolsSidebar activeTool={activeTool} onToolChange={setActiveTool} />}

        <Canvas
          ref={canvasRef}
          boardId={id!}
          activeTool={canEdit ? activeTool : "pan"}
          color={activeColor}
          strokeWidth={activeStrokeWidth}
          zoom={zoom}
          onZoomChange={setZoom}
          onSavingChange={setIsSaving}
          onCursorMove={updateCursor}
          readOnly={!canEdit}
        />

        {/* Live cursors overlay */}
        <LiveCursors cursors={cursors} zoom={zoom} offset={canvasOffset} />

        {/* Only show style toolbar if user can edit */}
        {canEdit && (
          <StyleToolbar
            activeColor={activeColor}
            activeStrokeWidth={activeStrokeWidth}
            onColorChange={setActiveColor}
            onStrokeWidthChange={setActiveStrokeWidth}
          />
        )}
      </div>

      {/* View-only banner for viewers */}
      {!canEdit && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)] shadow-lg">
          👁️ View only — you can pan and zoom but not edit
        </div>
      )}

      {/* Share/Invite Modal - only for owners */}
      {board.isOwner && (
        <InviteModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onSubmit={handleInvite}
          boardName={board.name}
          boardId={id!}
          isLoading={inviteToBoard.isPending}
        />
      )}

      {/* Delete Confirmation - only for owners */}
      {board.isOwner && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete board"
          message={`Are you sure you want to delete "${board.name}"? This action cannot be undone and all content will be permanently lost.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={deleteBoard.isPending}
        />
      )}

      {/* Board Settings - only for owners */}
      {board.isOwner && (
        <BoardSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          boardName={board.name}
          isPublic={board.isPublic}
          onUpdateSettings={handleUpdateSettings}
          isLoading={updateSettings.isPending}
        />
      )}
    </div>
  );
}
