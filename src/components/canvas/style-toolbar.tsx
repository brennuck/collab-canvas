import { useState } from "react";
import { Palette, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  { value: 2, height: "h-0.5", mobileHeight: "h-1" },
  { value: 4, height: "h-1", mobileHeight: "h-1.5" },
  { value: 8, height: "h-1.5", mobileHeight: "h-2" },
];

interface StyleToolbarProps {
  activeColor: string;
  activeStrokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export function StyleToolbar({
  activeColor,
  activeStrokeWidth,
  onColorChange,
  onStrokeWidthChange,
}: StyleToolbarProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  // Mobile: Compact FAB that expands
  if (isMobile) {
    return (
      <>
        {/* Color FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="fixed bottom-20 right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: activeColor }}
          aria-label="Style options"
        >
          <Palette className="h-5 w-5 text-white drop-shadow-md" />
        </button>

        {/* Expanded style picker */}
        {isExpanded && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/30"
              onClick={() => setIsExpanded(false)}
            />

            {/* Style sheet */}
            <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] pb-safe shadow-xl">
              {/* Handle bar */}
              <div className="flex items-center justify-center py-2">
                <div className="h-1 w-10 rounded-full bg-[var(--color-text-muted)]/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 pb-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">Style</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Colors */}
              <div className="p-4">
                <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Color
                </span>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onColorChange(color);
                        setIsExpanded(false);
                      }}
                      className={`h-10 w-10 rounded-full border-2 transition-transform active:scale-90 ${
                        activeColor === color
                          ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-surface-elevated)]"
                          : "border-[var(--color-border)]"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div className="border-t border-[var(--color-border)] p-4">
                <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Stroke Width
                </span>
                <div className="flex gap-3">
                  {strokeWidths.map((sw) => (
                    <button
                      key={sw.value}
                      onClick={() => {
                        onStrokeWidthChange(sw.value);
                        setIsExpanded(false);
                      }}
                      className={`flex h-12 w-16 items-center justify-center rounded-xl transition-colors ${
                        activeStrokeWidth === sw.value
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] active:bg-[var(--color-accent-muted)]"
                      }`}
                      aria-label={`Stroke width ${sw.value}px`}
                    >
                      <div className={`${sw.mobileHeight} w-8 rounded-full bg-current`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Safe area padding */}
              <div className="h-2" />
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop: Original horizontal toolbar
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-lg">
      {/* Color Picker */}
      <div className="flex items-center gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
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
            onClick={() => onStrokeWidthChange(sw.value)}
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
  );
}
