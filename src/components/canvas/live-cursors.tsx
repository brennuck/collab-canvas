import { CursorData } from "@/hooks/use-live-cursors";

interface LiveCursorsProps {
  cursors: CursorData[];
  zoom: number;
  offset: { x: number; y: number };
}

export function LiveCursors({ cursors, zoom, offset }: LiveCursorsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {cursors.map((cursor) => {
        // Transform canvas coordinates to screen coordinates
        const screenX = cursor.x * (zoom / 100) + offset.x;
        const screenY = cursor.y * (zoom / 100) + offset.y;

        return (
          <div
            key={cursor.odId}
            className="absolute"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
              zIndex: 9999,
              transition: "transform 50ms linear",
            }}
          >
            <div className="flex items-center gap-1">
              {/* Cursor pointer - matches home page style */}
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                className="drop-shadow-lg"
              >
                <path d="M0 0L16 12L8 12L4 20L0 0Z" fill={cursor.odColor} />
              </svg>
              {/* Name label */}
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-md"
                style={{ backgroundColor: cursor.odColor }}
              >
                {cursor.odName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

