import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface CursorData {
  odId: string;
  odName: string;
  odColor: string;
  x: number;
  y: number;
}

// Generic element type for syncing
export interface SyncElement {
  id: string;
  [key: string]: unknown;
}

interface UseLiveCursorsProps {
  boardId: string;
  userId: string | null;
  userName: string;
  enabled?: boolean;
  onElementAdded?: (element: SyncElement) => void;
  onElementUpdated?: (element: SyncElement) => void;
  onElementDeleted?: (elementId: string) => void;
  onElementsSynced?: (elements: SyncElement[]) => void;
}

// Generate a consistent color based on user ID
function generateUserColor(userId: string): string {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
  ];

  // Hash the user ID to get a consistent index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function useLiveCursors({
  boardId,
  userId,
  userName,
  enabled = true,
  onElementAdded,
  onElementUpdated,
  onElementDeleted,
  onElementsSynced,
}: UseLiveCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const userColor = userId ? generateUserColor(userId) : "#3b82f6";

  // Store callbacks in refs to avoid reconnecting when they change
  const callbacksRef = useRef({ onElementAdded, onElementUpdated, onElementDeleted, onElementsSynced });
  callbacksRef.current = { onElementAdded, onElementUpdated, onElementDeleted, onElementsSynced };

  // Generate stable anonymous ID
  const anonIdRef = useRef(`anon_${Math.random().toString(36).substr(2, 9)}`);
  const odId = userId || anonIdRef.current;

  // Connect to socket
  useEffect(() => {
    if (!enabled || !boardId) return;

    const socket = io("http://localhost:3000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);

      // Join the board room
      socket.emit("join-board", {
        boardId,
        odId,
        odName: userName || "Anonymous",
        odColor: userColor,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Receive current users when joining
    socket.on("current-users", (users: CursorData[]) => {
      setCursors(new Map(users.map((u) => [u.odId, u])));
    });

    // New user joined - add them to cursors with initial position
    socket.on("user-joined", (user: { odId: string; odName: string; odColor: string }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(user.odId, { ...user, x: 0, y: 0 });
        return next;
      });
    });

    // Cursor updates from other users
    socket.on("cursor-update", (data: CursorData) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(data.odId, data);
        return next;
      });
    });

    // User left
    socket.on("user-left", (data: { odId: string }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.delete(data.odId);
        return next;
      });
    });

    // Element sync events
    socket.on("element-added", (element: SyncElement) => {
      callbacksRef.current.onElementAdded?.(element);
    });

    socket.on("element-updated", (element: SyncElement) => {
      callbacksRef.current.onElementUpdated?.(element);
    });

    socket.on("element-deleted", (elementId: string) => {
      callbacksRef.current.onElementDeleted?.(elementId);
    });

    socket.on("elements-synced", (elements: SyncElement[]) => {
      callbacksRef.current.onElementsSynced?.(elements);
    });

    return () => {
      socket.emit("leave-board");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [boardId, odId, userName, userColor, enabled]);

  // Send cursor position (throttled)
  const lastSentRef = useRef<number>(0);
  const updateCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    // Throttle to ~30fps (33ms)
    if (now - lastSentRef.current < 33) return;
    lastSentRef.current = now;

    if (socketRef.current?.connected) {
      socketRef.current.emit("cursor-move", { x, y });
    }
  }, []);

  // Broadcast element changes
  const broadcastElementAdd = useCallback((element: SyncElement) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("element-add", element);
    }
  }, []);

  const broadcastElementUpdate = useCallback((element: SyncElement) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("element-update", element);
    }
  }, []);

  const broadcastElementDelete = useCallback((elementId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("element-delete", elementId);
    }
  }, []);

  const broadcastElementsSync = useCallback((elements: SyncElement[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("elements-sync", elements);
    }
  }, []);

  // Get all online user IDs (including self)
  const onlineUserIds = new Set(Array.from(cursors.keys()));
  if (isConnected) {
    onlineUserIds.add(odId);
  }

  return {
    cursors: Array.from(cursors.values()).filter((c) => c.odId !== odId),
    isConnected,
    updateCursor,
    userColor,
    onlineCount: onlineUserIds.size,
    onlineUserIds,
    // Element sync
    broadcastElementAdd,
    broadcastElementUpdate,
    broadcastElementDelete,
    broadcastElementsSync,
  };
}

