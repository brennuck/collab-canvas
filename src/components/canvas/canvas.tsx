import { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import { trpc } from "@/lib/trpc";

export type Tool =
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "text"
  | "sticky"
  | "card"
  | "pencil"
  | "line"
  | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: "pencil" | "line" | "rectangle" | "circle" | "text" | "sticky" | "card";
  points?: Point[]; // For pencil/freehand
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number; // For line
  endY?: number; // For line
  text?: string;
  header?: string; // For card
  description?: string; // For card
  color: string;
  strokeWidth: number;
  fill?: string;
}

interface CanvasProps {
  boardId: string;
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSavingChange?: (isSaving: boolean) => void;
  onCursorMove?: (x: number, y: number) => void;
  readOnly?: boolean;
  // Real-time sync
  onElementAdd?: (element: CanvasElement) => void;
  onElementUpdate?: (element: CanvasElement) => void;
  onElementDelete?: (elementId: string) => void;
}

export interface CanvasRef {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  offset: { x: number; y: number };
  zoom: number;
  // Remote sync methods
  handleRemoteElementAdd: (element: CanvasElement) => void;
  handleRemoteElementUpdate: (element: CanvasElement) => void;
  handleRemoteElementDelete: (elementId: string) => void;
  handleRemoteElementsSync: (elements: CanvasElement[]) => void;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas(
  {
    boardId,
    activeTool,
    color,
    strokeWidth,
    zoom,
    onZoomChange,
    onSavingChange,
    onCursorMove,
    readOnly = false,
    onElementAdd,
    onElementUpdate,
    onElementDelete,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Pan state
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Drag state for moving elements
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Text input state
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [textValue, setTextValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Card input state
  const [cardInput, setCardInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [cardHeader, setCardHeader] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const cardHeaderRef = useRef<HTMLInputElement>(null);
  const cardDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Track if initial load is done and for which board
  const [loadedBoardId, setLoadedBoardId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load elements from database
  const { data: savedElements, isFetched } = trpc.elements.list.useQuery(
    { boardId },
    { enabled: !!boardId }
  );

  // Mutation for saving all elements (debounced batch sync)
  const syncElements = trpc.elements.batchSync.useMutation({
    onMutate: () => onSavingChange?.(true),
    onSettled: () => onSavingChange?.(false),
  });

  // Load saved elements when data arrives or board changes
  // Using derived state pattern to avoid useEffect with setState
  const needsLoad = isFetched && loadedBoardId !== boardId;
  if (needsLoad) {
    const loadedElements: CanvasElement[] = (savedElements ?? []).map((el) => ({
      id: el.id,
      type: el.type as CanvasElement["type"],
      x: el.x,
      y: el.y,
      width: el.width ?? undefined,
      height: el.height ?? undefined,
      points: el.points,
      endX: el.endX,
      endY: el.endY,
      text: el.text,
      header: el.header,
      description: el.description,
      color: el.color,
      strokeWidth: el.strokeWidth,
      fill: el.fill,
    }));
    setLoadedBoardId(boardId);
    setElements(loadedElements);
    setHistory([loadedElements]);
    setHistoryIndex(0);
  }

  // Debounced save to database
  const saveToDatabase = useCallback(
    (elementsToSave: CanvasElement[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        syncElements.mutate({
          boardId,
          elements: elementsToSave,
        });
      }, 1000); // Debounce 1 second
    },
    [boardId, syncElements]
  );

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Push new state to history and save
  const pushToHistory = useCallback(
    (newElements: CanvasElement[]) => {
      setHistory((prev) => {
        // Remove any future history (if we undid and then made a new change)
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
      // Save to database (debounced)
      saveToDatabase(newElements);
    },
    [historyIndex, saveToDatabase]
  );

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const restoredElements = history[newIndex] ?? [];
      setHistoryIndex(newIndex);
      setElements(restoredElements);
      setSelectedId(null);
      saveToDatabase(restoredElements);
    }
  }, [historyIndex, history, saveToDatabase]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const restoredElements = history[newIndex] ?? [];
      setHistoryIndex(newIndex);
      setElements(restoredElements);
      setSelectedId(null);
      saveToDatabase(restoredElements);
    }
  }, [historyIndex, history, saveToDatabase]);

  // Remote sync handlers - receive changes from other users
  const handleRemoteElementAdd = useCallback((element: CanvasElement) => {
    setElements((prev) => {
      // Don't add if already exists
      if (prev.some((el) => el.id === element.id)) return prev;
      return [...prev, element];
    });
  }, []);

  const handleRemoteElementUpdate = useCallback((element: CanvasElement) => {
    setElements((prev) => prev.map((el) => (el.id === element.id ? element : el)));
  }, []);

  const handleRemoteElementDelete = useCallback((elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
  }, []);

  const handleRemoteElementsSync = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
  }, []);

  // Expose undo/redo and remote sync via ref
  useImperativeHandle(
    ref,
    () => ({
      undo,
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      offset,
      zoom,
      handleRemoteElementAdd,
      handleRemoteElementUpdate,
      handleRemoteElementDelete,
      handleRemoteElementsSync,
    }),
    [
      undo,
      redo,
      historyIndex,
      history.length,
      offset,
      zoom,
      handleRemoteElementAdd,
      handleRemoteElementUpdate,
      handleRemoteElementDelete,
      handleRemoteElementsSync,
    ]
  );

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

  // Draw grid background
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
    },
    [offset, zoom]
  );

  // Draw a single element
  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, el: CanvasElement, isSelected: boolean) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.fill || el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (el.type) {
        case "pencil": {
          if (el.points && el.points.length > 0) {
            ctx.beginPath();
            const firstPoint = el.points[0];
            if (firstPoint) {
              ctx.moveTo(firstPoint.x, firstPoint.y);
            }
            for (let i = 1; i < el.points.length; i++) {
              const point = el.points[i];
              if (point) {
                ctx.lineTo(point.x, point.y);
              }
            }
            ctx.stroke();
          }
          break;
        }

        case "line": {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(el.endX ?? el.x, el.endY ?? el.y);
          ctx.stroke();
          break;
        }

        case "rectangle": {
          ctx.strokeRect(el.x, el.y, el.width ?? 0, el.height ?? 0);
          break;
        }

        case "circle": {
          const radiusX = Math.abs((el.width ?? 0) / 2);
          const radiusY = Math.abs((el.height ?? 0) / 2);
          const centerX = el.x + (el.width ?? 0) / 2;
          const centerY = el.y + (el.height ?? 0) / 2;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case "text": {
          ctx.font = `${16 * (el.strokeWidth / 2)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = el.color;
          ctx.fillText(el.text ?? "", el.x, el.y);
          break;
        }

        case "sticky": {
          const w = el.width ?? 180;
          const h = el.height ?? 180;
          const radius = 16;
          const x = el.x;
          const y = el.y;

          // Draw rounded rectangle helper
          const drawRoundedRect = (
            cx: CanvasRenderingContext2D,
            rx: number,
            ry: number,
            rw: number,
            rh: number,
            r: number
          ) => {
            cx.beginPath();
            cx.moveTo(rx + r, ry);
            cx.lineTo(rx + rw - r, ry);
            cx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
            cx.lineTo(rx + rw, ry + rh - r);
            cx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
            cx.lineTo(rx + r, ry + rh);
            cx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
            cx.lineTo(rx, ry + r);
            cx.quadraticCurveTo(rx, ry, rx + r, ry);
            cx.closePath();
          };

          // Outer shadow
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 24;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 8;

          // Uniform frosted glass background
          drawRoundedRect(ctx, x, y, w, h, radius);
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.fill();
          ctx.restore();

          // Border - crisp frosted edge
          drawRoundedRect(ctx, x, y, w, h, radius);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text
          if (el.text) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.font = "500 15px 'Inter', system-ui, sans-serif";
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;

            const lines = el.text.split("\n");
            const lineHeight = 22;
            const padding = 16;

            lines.forEach((line, i) => {
              ctx.fillText(line, x + padding, y + padding + 18 + i * lineHeight);
            });

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          break;
        }

        case "card": {
          const w = el.width ?? 320;
          const h = el.height ?? 200;
          const radius = 12;
          const x = el.x;
          const y = el.y;
          const cardColor = el.color || "#3b82f6";

          // Draw rounded rectangle helper
          const drawRoundedRect = (
            cx: CanvasRenderingContext2D,
            rx: number,
            ry: number,
            rw: number,
            rh: number,
            r: number
          ) => {
            cx.beginPath();
            cx.moveTo(rx + r, ry);
            cx.lineTo(rx + rw - r, ry);
            cx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
            cx.lineTo(rx + rw, ry + rh - r);
            cx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
            cx.lineTo(rx + r, ry + rh);
            cx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
            cx.lineTo(rx, ry + r);
            cx.quadraticCurveTo(rx, ry, rx + r, ry);
            cx.closePath();
          };

          // Outer shadow
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 8;

          // Card background with color
          drawRoundedRect(ctx, x, y, w, h, radius);
          ctx.fillStyle = cardColor;
          ctx.fill();
          ctx.restore();

          // Header section background (darker shade)
          const headerHeight = 60;
          drawRoundedRect(ctx, x, y, w, headerHeight, radius);
          ctx.fillStyle = cardColor;
          ctx.globalAlpha = 0.8;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Border
          drawRoundedRect(ctx, x, y, w, h, radius);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Header text
          if (el.header) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.font = "600 18px 'Inter', system-ui, sans-serif";
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;

            const padding = 20;
            ctx.fillText(el.header, x + padding, y + padding + 20);
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          // Description text
          if (el.description) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.font = "400 14px 'Inter', system-ui, sans-serif";
            ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;

            const padding = 20;
            const lineHeight = 20;
            const maxWidth = w - padding * 2;
            const startY = y + headerHeight + padding + 10;

            // Simple text wrapping
            const words = el.description.split(" ");
            let line = "";
            let currentY = startY;

            words.forEach((word) => {
              const testLine = line + word + " ";
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && line) {
                ctx.fillText(line, x + padding, currentY);
                line = word + " ";
                currentY += lineHeight;
              } else {
                line = testLine;
              }
            });
            if (line) {
              ctx.fillText(line, x + padding, currentY);
            }

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          break;
        }
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
          ctx.strokeRect(el.x - 5, el.y - 5, (el.width ?? 0) + 10, (el.height ?? 0) + 10);
        }

        ctx.setLineDash([]);
      }
    },
    []
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
  }, [elements, currentElement, offset, zoom, selectedId, drawGrid, drawElement]);

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getCanvasPoint(e);

    // Pan is always allowed (even in readOnly mode)
    if (activeTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    // Block all other interactions in readOnly mode
    if (readOnly) return;

    if (activeTool === "select") {
      // Find element at click position
      const clickedElement = findElementAtPoint(point);
      setSelectedId(clickedElement?.id ?? null);

      // Start dragging if we clicked on an element
      if (clickedElement) {
        setIsDragging(true);
        // Calculate offset from element origin to click point
        setDragOffset({
          x: point.x - clickedElement.x,
          y: point.y - clickedElement.y,
        });
      }
      return;
    }

    if (activeTool === "eraser") {
      const clickedElement = findElementAtPoint(point);
      if (clickedElement) {
        const newElements = elements.filter((el) => el.id !== clickedElement.id);
        setElements(newElements);
        pushToHistory(newElements);
        // Broadcast delete to other users
        onElementDelete?.(clickedElement.id);
      }
      return;
    }

    if (activeTool === "text" || activeTool === "sticky") {
      setTextInput({ x: e.clientX, y: e.clientY, visible: true });
      setTextValue("");
      setTimeout(() => textInputRef.current?.focus(), 0);
      return;
    }

    if (activeTool === "card") {
      setCardInput({ x: e.clientX, y: e.clientY, visible: true });
      setCardHeader("");
      setCardDescription("");
      setTimeout(() => cardHeaderRef.current?.focus(), 0);
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
    // Broadcast cursor position for live cursors
    if (onCursorMove) {
      const point = getCanvasPoint(e);
      onCursorMove(point.x, point.y);
    }

    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Handle dragging selected element
    if (isDragging && selectedId) {
      const point = getCanvasPoint(e);
      const newX = point.x - dragOffset.x;
      const newY = point.y - dragOffset.y;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedId) return el;

          // Calculate the delta for moving
          const deltaX = newX - el.x;
          const deltaY = newY - el.y;

          // For pencil, we need to move all points
          if (el.type === "pencil" && el.points) {
            return {
              ...el,
              x: newX,
              y: newY,
              points: el.points.map((p) => ({
                x: p.x + deltaX,
                y: p.y + deltaY,
              })),
            };
          }

          // For line, move both start and end points
          if (el.type === "line") {
            return {
              ...el,
              x: newX,
              y: newY,
              endX: (el.endX ?? el.x) + deltaX,
              endY: (el.endY ?? el.y) + deltaY,
            };
          }

          // For other elements, just update x and y
          return {
            ...el,
            x: newX,
            y: newY,
          };
        })
      );
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

    // Finish dragging - save to history
    if (isDragging && selectedId) {
      setIsDragging(false);
      pushToHistory(elements);
      // Broadcast the updated element position
      const updatedElement = elements.find((el) => el.id === selectedId);
      if (updatedElement) {
        onElementUpdate?.(updatedElement);
      }
      return;
    }

    if (currentElement) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      pushToHistory(newElements);
      // Broadcast new element to other users
      onElementAdd?.(currentElement);
      setCurrentElement(null);
    }

    setIsDrawing(false);
  };

  // Find element at a specific point
  const findElementAtPoint = (point: Point): CanvasElement | undefined => {
    // Search in reverse order (top elements first)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (!el) continue;

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
      x: (textInput.x - rect.left - offset.x) / (zoom / 100),
      y: (textInput.y - rect.top - offset.y) / (zoom / 100),
    };

    const newElement: CanvasElement = {
      id: generateId(),
      type: activeTool === "sticky" ? "sticky" : "text",
      x: point.x,
      y: point.y,
      width: activeTool === "sticky" ? 180 : undefined,
      height: activeTool === "sticky" ? 180 : undefined,
      text: textValue,
      color,
      strokeWidth,
      fill: activeTool === "sticky" ? "#fef08a" : undefined,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    pushToHistory(newElements);
    // Broadcast new element to other users
    onElementAdd?.(newElement);
    setTextInput({ x: 0, y: 0, visible: false });
    setTextValue("");
  };

  // Handle card input submission
  const handleCardSubmit = () => {
    if (!cardHeader.trim() && !cardDescription.trim()) {
      setCardInput({ x: 0, y: 0, visible: false });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: (cardInput.x - rect.left - offset.x) / (zoom / 100),
      y: (cardInput.y - rect.top - offset.y) / (zoom / 100),
    };

    const newElement: CanvasElement = {
      id: generateId(),
      type: "card",
      x: point.x,
      y: point.y,
      width: 320,
      height: 200,
      header: cardHeader.trim() || undefined,
      description: cardDescription.trim() || undefined,
      color,
      strokeWidth,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    pushToHistory(newElements);
    // Broadcast new element to other users
    onElementAdd?.(newElement);
    setCardInput({ x: 0, y: 0, visible: false });
    setCardHeader("");
    setCardDescription("");
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
    const zoomSensitivity = 0.04;
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
        return isDragging ? "grabbing" : selectedId ? "move" : "default";
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
        <div className="absolute z-20" style={{ left: textInput.x, top: textInput.y }}>
          {activeTool === "sticky" ? (
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                width: 180,
                height: 180,
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1.5px solid rgba(255, 255, 255, 0.25)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
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
                placeholder="Add note..."
                className="h-full w-full resize-none bg-transparent p-4 text-[15px] font-medium text-white/90 placeholder-white/40 focus:outline-none"
                style={{
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          ) : (
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
              placeholder="Type text..."
              className="h-10 w-48 rounded-lg border-2 border-[var(--color-accent)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] shadow-lg focus:outline-none"
            />
          )}
        </div>
      )}

      {/* Card input overlay */}
      {cardInput.visible && (
        <>
          {/* Backdrop to close on click outside */}
          <div className="fixed inset-0 z-10" onClick={handleCardSubmit} />
          <div className="absolute z-20" style={{ left: cardInput.x, top: cardInput.y }}>
            <div
              className="overflow-hidden rounded-xl border-2 shadow-2xl"
              style={{
                width: 320,
                background: color,
                borderColor: color,
                boxShadow: `0 8px 32px ${color}40`,
              }}
            >
              {/* Header section */}
              <div
                className="px-4 py-3"
                style={{
                  background: `${color}CC`,
                }}
              >
                <input
                  ref={cardHeaderRef}
                  type="text"
                  value={cardHeader}
                  onChange={(e) => setCardHeader(e.target.value)}
                  placeholder="Card title..."
                  className="w-full bg-transparent text-lg font-semibold text-white placeholder-white/60 focus:outline-none"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      cardDescriptionRef.current?.focus();
                    }
                    if (e.key === "Escape") {
                      setCardInput({ x: 0, y: 0, visible: false });
                      setCardHeader("");
                      setCardDescription("");
                    }
                  }}
                />
              </div>

              {/* Description section */}
              <div className="px-4 py-3">
                <textarea
                  ref={cardDescriptionRef}
                  value={cardDescription}
                  onChange={(e) => setCardDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setCardInput({ x: 0, y: 0, visible: false });
                      setCardHeader("");
                      setCardDescription("");
                    }
                    // Ctrl+Enter or Cmd+Enter to submit
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleCardSubmit();
                    }
                  }}
                  placeholder="Add description... (Ctrl+Enter to save)"
                  className="min-h-[100px] w-full resize-none bg-transparent text-sm text-white/90 placeholder-white/50 focus:outline-none"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end gap-2 border-t border-white/20 px-4 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setCardInput({ x: 0, y: 0, visible: false });
                    setCardHeader("");
                    setCardDescription("");
                  }}
                  className="rounded px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCardSubmit}
                  className="rounded bg-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/30"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
