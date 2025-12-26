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

