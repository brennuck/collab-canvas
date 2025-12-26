import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { getInitials } from "@/lib/format";
import { Canvas, type Tool } from "@/components/canvas/canvas";
import {
  ArrowLeft,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  StickyNote,
  Pencil,
  Minus,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Users,
  Share2,
  MoreHorizontal,
  Loader2,
  Download,
  Maximize,
} from "lucide-react";

const tools: { id: Tool; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "pencil", icon: Pencil, label: "Draw", shortcut: "P" },
  { id: "line", icon: Minus, label: "Line", shortcut: "L" },
  { id: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "circle", icon: Circle, label: "Circle", shortcut: "O" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "sticky", icon: StickyNote, label: "Sticky Note", shortcut: "S" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
];

const colors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#ffffff", // white
  "#000000", // black
];

const strokeWidths = [
  { value: 2, height: "h-0.5" },
  { value: 4, height: "h-1" },
  { value: 8, height: "h-1.5" },
];

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
      {/* Top Navbar */}
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
          <h1 className="text-sm font-semibold text-[var(--color-text)]">{board.name}</h1>
          {board.userRole !== "owner" && (
            <span className="rounded bg-[var(--color-surface-hover)] px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
              {board.userRole}
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
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="min-w-[3rem] rounded px-1 py-0.5 text-center text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)]"
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(400, z + 25))}
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
            {allMembers.slice(0, 5).map((member, i) => (
              <div
                key={member.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-[10px] font-semibold text-white"
                style={{ zIndex: allMembers.length - i }}
                title={member.name ?? member.email}
              >
                {getInitials(member.name, member.email)}
              </div>
            ))}
            {allMembers.length > 5 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-surface-elevated)] bg-[var(--color-surface-hover)] text-[10px] font-semibold text-[var(--color-text-muted)]">
                +{allMembers.length - 5}
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

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-lg">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`rounded-lg p-2 transition-colors ${
                  isActive
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                }`}
                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </aside>

        {/* Canvas Area */}
        <Canvas
          activeTool={activeTool}
          color={activeColor}
          strokeWidth={activeStrokeWidth}
          zoom={zoom}
          onZoomChange={setZoom}
        />

        {/* Bottom Toolbar */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-lg">
          {/* Color Picker */}
          <div className="flex items-center gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setActiveColor(color)}
                className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                  activeColor === color
                    ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-offset-1 ring-offset-[var(--color-surface-elevated)]"
                    : "border-[var(--color-border)]"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-[var(--color-border)]" />

          {/* Stroke Width */}
          <div className="flex items-center gap-1.5">
            {strokeWidths.map((sw) => (
              <button
                key={sw.value}
                onClick={() => setActiveStrokeWidth(sw.value)}
                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                  activeStrokeWidth === sw.value
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                title={`Stroke width: ${sw.value}px`}
              >
                <div className={`${sw.height} w-3 rounded-full bg-current`} />
              </button>
            ))}
          </div>
        </div>

        {/* Minimap / Quick Actions */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-lg">
          <button
            onClick={() => setZoom(100)}
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            title="Fit to screen"
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            title="View collaborators"
          >
            <Users className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
