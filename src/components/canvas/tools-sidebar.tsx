import { useState } from "react";
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
  CreditCard,
  X,
} from "lucide-react";
import type { Tool } from "./canvas";
import { useIsMobile } from "@/hooks/use-mobile";

const tools: { id: Tool; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "pencil", icon: Pencil, label: "Draw", shortcut: "P" },
  { id: "line", icon: Minus, label: "Line", shortcut: "L" },
  { id: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "circle", icon: Circle, label: "Circle", shortcut: "O" },
  { id: "text", icon: Type, label: "Text", shortcut: "T" },
  { id: "sticky", icon: StickyNote, label: "Sticky Note", shortcut: "S" },
  { id: "card", icon: CreditCard, label: "Card", shortcut: "C" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
];

interface ToolsSidebarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function ToolsSidebar({ activeTool, onToolChange }: ToolsSidebarProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the active tool's icon for the mobile fab button
  const ActiveIcon = tools.find((t) => t.id === activeTool)?.icon || Pencil;

  // Mobile: Bottom sheet style toolbar
  if (isMobile) {
    return (
      <>
        {/* Floating Action Button to show current tool & expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="fixed bottom-20 left-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-accent)] text-white shadow-lg transition-transform active:scale-95"
          aria-label="Toggle tools"
        >
          <ActiveIcon className="h-5 w-5" />
        </button>

        {/* Expandable tool palette */}
        {isExpanded && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/30"
              onClick={() => setIsExpanded(false)}
            />

            {/* Tool palette - bottom sheet */}
            <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] pb-safe shadow-xl">
              {/* Handle bar */}
              <div className="flex items-center justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-[var(--color-text-muted)]/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 pb-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">Tools</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tool grid */}
              <div className="grid grid-cols-5 gap-1 p-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onToolChange(tool.id);
                        setIsExpanded(false);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-colors ${
                        isActive
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-muted)] active:bg-[var(--color-surface-hover)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Safe area padding for iOS */}
              <div className="h-2" />
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop: Original sidebar
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
