import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { Canvas, type Tool } from "@/components/canvas/canvas";
import { ToolsSidebar, tools } from "@/components/canvas/tools-sidebar";
import { BoardHeader } from "@/components/canvas/board-header";
import { StyleToolbar } from "@/components/canvas/style-toolbar";
import { QuickActions } from "@/components/canvas/quick-actions";
import { ArrowLeft, Loader2 } from "lucide-react";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Canvas state
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [zoom, setZoom] = useState(100);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(4);

  const {
    data: board,
    isLoading,
    error,
  } = trpc.boards.get.useQuery({ id: id! }, { enabled: !!id });

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();
    const tool = tools.find((t) => t.shortcut?.toLowerCase() === key);
    if (tool) {
      setActiveTool(tool.id);
    }
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

  const allMembers = [{ ...board.owner, role: "owner" as const }, ...board.members];

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
      />

      <div className="relative flex flex-1 overflow-hidden">
        <ToolsSidebar activeTool={activeTool} onToolChange={setActiveTool} />

        <Canvas
          activeTool={activeTool}
          color={activeColor}
          strokeWidth={activeStrokeWidth}
          zoom={zoom}
          onZoomChange={setZoom}
        />

        <StyleToolbar
          activeColor={activeColor}
          activeStrokeWidth={activeStrokeWidth}
          onColorChange={setActiveColor}
          onStrokeWidthChange={setActiveStrokeWidth}
        />

        <QuickActions onFitToScreen={() => setZoom(100)} />
      </div>
    </div>
  );
}
