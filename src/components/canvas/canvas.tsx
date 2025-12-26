import { useRef, useState, useCallback, useEffect } from "react";

export type Tool =
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "text"
  | "sticky"
  | "pencil"
  | "line"
  | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: "pencil" | "line" | "rectangle" | "circle" | "text" | "sticky";
  points?: Point[]; // For pencil/freehand
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number; // For line
  endY?: number; // For line
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: string;
}

interface CanvasProps {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function Canvas({ activeTool, color, strokeWidth, zoom, onZoomChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Pan state
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Text input state
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [textValue, setTextValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get mouse position relative to canvas with zoom and offset
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: ((e.clientX - rect.left) * scaleX - offset.x) / (zoom / 100),
        y: ((e.clientY - rect.top) * scaleY - offset.y) / (zoom / 100),
      };
    },
    [offset, zoom]
  );

  // Draw all elements on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom / 100, zoom / 100);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all elements
    [...elements, currentElement].filter(Boolean).forEach((el) => {
      if (!el) return;
      drawElement(ctx, el, el.id === selectedId);
    });

    // Restore context
    ctx.restore();
  }, [elements, currentElement, offset, zoom, selectedId]);

  // Draw grid background
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;

    const startX = -offset.x / (zoom / 100);
    const startY = -offset.y / (zoom / 100);
    const endX = startX + width / (zoom / 100);
    const endY = startY + height / (zoom / 100);

    for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  };

  // Draw a single element
  const drawElement = (
    ctx: CanvasRenderingContext2D,
    el: CanvasElement,
    isSelected: boolean
  ) => {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.fill || el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (el.type) {
      case "pencil":
        if (el.points && el.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.endX ?? el.x, el.endY ?? el.y);
        ctx.stroke();
        break;

      case "rectangle":
        ctx.strokeRect(el.x, el.y, el.width ?? 0, el.height ?? 0);
        break;

      case "circle":
        const radiusX = Math.abs((el.width ?? 0) / 2);
        const radiusY = Math.abs((el.height ?? 0) / 2);
        const centerX = el.x + (el.width ?? 0) / 2;
        const centerY = el.y + (el.height ?? 0) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "text":
        ctx.font = `${16 * (el.strokeWidth / 2)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = el.color;
        ctx.fillText(el.text ?? "", el.x, el.y);
        break;

      case "sticky":
        // Background
        ctx.fillStyle = el.fill || "#fef08a";
        ctx.fillRect(el.x, el.y, el.width ?? 150, el.height ?? 150);

        // Border
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(el.x, el.y, el.width ?? 150, el.height ?? 150);

        // Text
        if (el.text) {
          ctx.fillStyle = "#1f2937";
          ctx.font = "14px Inter, system-ui, sans-serif";
          const lines = el.text.split("\n");
          lines.forEach((line, i) => {
            ctx.fillText(line, el.x + 10, el.y + 24 + i * 20);
          });
        }
        break;
    }

    // Draw selection indicator
    if (isSelected) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (el.type === "pencil" && el.points) {
        const minX = Math.min(...el.points.map((p) => p.x));
        const maxX = Math.max(...el.points.map((p) => p.x));
        const minY = Math.min(...el.points.map((p) => p.y));
        const maxY = Math.max(...el.points.map((p) => p.y));
        ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
      } else if (el.type === "line") {
        const minX = Math.min(el.x, el.endX ?? el.x) - 5;
        const minY = Math.min(el.y, el.endY ?? el.y) - 5;
        const maxX = Math.max(el.x, el.endX ?? el.x) + 5;
        const maxY = Math.max(el.y, el.endY ?? el.y) + 5;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      } else {
        ctx.strokeRect(
          el.x - 5,
          el.y - 5,
          (el.width ?? 0) + 10,
          (el.height ?? 0) + 10
        );
      }

      ctx.setLineDash([]);
    }
  };

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    if (activeTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    if (activeTool === "select") {
      // Find element at click position
      const clickedElement = findElementAtPoint(point);
      setSelectedId(clickedElement?.id ?? null);
      return;
    }

    if (activeTool === "eraser") {
      const clickedElement = findElementAtPoint(point);
      if (clickedElement) {
        setElements((prev) => prev.filter((el) => el.id !== clickedElement.id));
      }
      return;
    }

    if (activeTool === "text" || activeTool === "sticky") {
      setTextInput({ x: e.clientX, y: e.clientY, visible: true });
      setTextValue("");
      setTimeout(() => textInputRef.current?.focus(), 0);
      return;
    }

    setIsDrawing(true);
    setSelectedId(null);

    const newElement: CanvasElement = {
      id: generateId(),
      type: activeTool as CanvasElement["type"],
      x: point.x,
      y: point.y,
      color,
      strokeWidth,
      points: activeTool === "pencil" ? [point] : undefined,
    };

    setCurrentElement(newElement);
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !currentElement) return;

    const point = getCanvasPoint(e);

    setCurrentElement((prev) => {
      if (!prev) return null;

      switch (prev.type) {
        case "pencil":
          return {
            ...prev,
            points: [...(prev.points ?? []), point],
          };

        case "line":
          return {
            ...prev,
            endX: point.x,
            endY: point.y,
          };

        case "rectangle":
        case "circle":
          return {
            ...prev,
            width: point.x - prev.x,
            height: point.y - prev.y,
          };

        default:
          return prev;
      }
    });
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (currentElement) {
      setElements((prev) => [...prev, currentElement]);
      setCurrentElement(null);
    }

    setIsDrawing(false);
  };

  // Find element at a specific point
  const findElementAtPoint = (point: Point): CanvasElement | undefined => {
    // Search in reverse order (top elements first)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];

      if (el.type === "pencil" && el.points) {
        const minX = Math.min(...el.points.map((p) => p.x));
        const maxX = Math.max(...el.points.map((p) => p.x));
        const minY = Math.min(...el.points.map((p) => p.y));
        const maxY = Math.max(...el.points.map((p) => p.y));

        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
          return el;
        }
      } else if (el.type === "line") {
        // Simple bounding box check for lines
        const minX = Math.min(el.x, el.endX ?? el.x) - 5;
        const maxX = Math.max(el.x, el.endX ?? el.x) + 5;
        const minY = Math.min(el.y, el.endY ?? el.y) - 5;
        const maxY = Math.max(el.y, el.endY ?? el.y) + 5;

        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
          return el;
        }
      } else {
        const width = el.width ?? 150;
        const height = el.height ?? 150;

        if (
          point.x >= el.x &&
          point.x <= el.x + width &&
          point.y >= el.y &&
          point.y <= el.y + height
        ) {
          return el;
        }
      }
    }
    return undefined;
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (!textValue.trim()) {
      setTextInput({ x: 0, y: 0, visible: false });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: ((textInput.x - rect.left) - offset.x) / (zoom / 100),
      y: ((textInput.y - rect.top) - offset.y) / (zoom / 100),
    };

    const newElement: CanvasElement = {
      id: generateId(),
      type: activeTool === "sticky" ? "sticky" : "text",
      x: point.x,
      y: point.y,
      width: activeTool === "sticky" ? 150 : undefined,
      height: activeTool === "sticky" ? 150 : undefined,
      text: textValue,
      color,
      strokeWidth,
      fill: activeTool === "sticky" ? "#fef08a" : undefined,
    };

    setElements((prev) => [...prev, newElement]);
    setTextInput({ x: 0, y: 0, visible: false });
    setTextValue("");
  };

  // Handle wheel for zooming (centered on cursor)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Get cursor position relative to canvas
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Calculate zoom delta
    const zoomSensitivity = 0.1;
    const delta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity;
    const newZoom = Math.min(400, Math.max(25, zoom * (1 + delta)));

    // Calculate the world point under the cursor before zoom
    const worldX = (cursorX - offset.x) / (zoom / 100);
    const worldY = (cursorY - offset.y) / (zoom / 100);

    // Calculate new offset so the same world point stays under cursor
    const newOffsetX = cursorX - worldX * (newZoom / 100);
    const newOffsetY = cursorY - worldY * (newZoom / 100);

    setOffset({ x: newOffsetX, y: newOffsetY });
    onZoomChange(Math.round(newZoom));
  };

  // Resize canvas to fill container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [draw]);

  // Redraw when state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Get cursor style based on active tool
  const getCursor = () => {
    switch (activeTool) {
      case "pan":
        return isPanning ? "grabbing" : "grab";
      case "select":
        return "default";
      case "eraser":
        return "crosshair";
      case "text":
        return "text";
      default:
        return "crosshair";
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Text input overlay */}
      {textInput.visible && (
        <div
          className="absolute z-20"
          style={{ left: textInput.x, top: textInput.y }}
        >
          <textarea
            ref={textInputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
              if (e.key === "Escape") {
                setTextInput({ x: 0, y: 0, visible: false });
                setTextValue("");
              }
            }}
            placeholder={activeTool === "sticky" ? "Add note..." : "Type text..."}
            className={`rounded-lg border-2 border-[var(--color-accent)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] shadow-lg focus:outline-none ${
              activeTool === "sticky" ? "h-32 w-40" : "h-10 w-48"
            }`}
            style={{
              backgroundColor: activeTool === "sticky" ? "#fef08a" : undefined,
              color: activeTool === "sticky" ? "#1f2937" : undefined,
            }}
          />
        </div>
      )}
    </div>
  );
}

