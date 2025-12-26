import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Canvas, type Tool, type CanvasRef } from "@/components/canvas/canvas";
import { ToolsSidebar, tools } from "@/components/canvas/tools-sidebar";
import { BoardHeader } from "@/components/canvas/board-header";
import { StyleToolbar } from "@/components/canvas/style-toolbar";
import { QuickActions } from "@/components/canvas/quick-actions";
import { InviteModal } from "@/components/boards/invite-modal";
import { ConfirmModal } from "@/components/ui/modal";
import { ArrowLeft, Loader2 } from "lucide-react";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const canvasRef = useRef<CanvasRef>(null);

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

  // Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  // Sync history state from canvas ref
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        setCanUndo(canvasRef.current.canUndo);
        setCanRedo(canvasRef.current.canRedo);
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
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--color-surface)]">
        <p className="text-lg text-[var(--color-text-muted)]">
          {error?.message || "Board not found"}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const allMembers = [
    { ...board.owner, role: "owner" as const, isOnline: true },
    ...board.members.map((m) => ({ ...m, isOnline: true })),
  ];

  const handleRename = (name: string) => {
    renameBoard.mutate({ id: id!, name });
  };

  const handleInvite = (email: string, role: "viewer" | "editor" | "admin") => {
    inviteToBoard.mutate({ boardId: id!, email, role });
  };

  const handleDelete = () => {
    deleteBoard.mutate({ id: id! });
  };

  return (
    <div
      className="flex h-screen flex-col bg-[var(--color-surface)]"
      onKeyDown={handleKeyDown}
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
        onRename={handleRename}
        onShare={() => setShareModalOpen(true)}
        onDelete={() => setDeleteModalOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isConnected={true}
        isSaving={isSaving || renameBoard.isPending}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <ToolsSidebar activeTool={activeTool} onToolChange={setActiveTool} />

        <Canvas
          ref={canvasRef}
          boardId={id!}
          activeTool={activeTool}
          color={activeColor}
          strokeWidth={activeStrokeWidth}
          zoom={zoom}
          onZoomChange={setZoom}
          onSavingChange={setIsSaving}
        />

        <StyleToolbar
          activeColor={activeColor}
          activeStrokeWidth={activeStrokeWidth}
          onColorChange={setActiveColor}
          onStrokeWidthChange={setActiveStrokeWidth}
        />

        <QuickActions onFitToScreen={() => setZoom(100)} />
      </div>

      {/* Share/Invite Modal */}
      <InviteModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSubmit={handleInvite}
        boardName={board.name}
        isLoading={inviteToBoard.isPending}
      />

      {/* Delete Confirmation */}
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
    </div>
  );
}
