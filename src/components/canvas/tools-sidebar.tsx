import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  StickyNote,
  Pencil,
  Minus,
  Eraser,
} from "lucide-react";
import type { Tool } from "./canvas";

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

interface ToolsSidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function ToolsSidebar({ activeTool, onToolChange }: ToolsSidebarProps) {
  return (
    <aside className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-lg">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
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
  );
}

// Export tools array for keyboard shortcut handling
export { tools };

