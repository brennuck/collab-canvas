import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface CursorData {
  odId: string;
  odName: string;
  odColor: string;
  x: number;
  y: number;
}

interface UseLiveCursorsProps {
  boardId: string;
  userId: string | null;
  userName: string;
  enabled?: boolean;
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
}: UseLiveCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const userColor = userId ? generateUserColor(userId) : "#3b82f6";

  // Generate stable anonymous ID
  const anonIdRef = useRef(`anon_${Math.random().toString(36).substr(2, 9)}`);
  const odId = userId || anonIdRef.current;

  // Connect to socket
  useEffect(() => {
    if (!enabled || !boardId) return;

    console.log("[LiveCursors] Connecting to socket...");

    const socket = io("http://localhost:3000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[LiveCursors] Connected! Socket ID:", socket.id);
      setIsConnected(true);

      // Join the board room
      socket.emit("join-board", {
        boardId,
        odId,
        odName: userName || "Anonymous",
        odColor: userColor,
      });
    });

    socket.on("connect_error", (error) => {
      console.error("[LiveCursors] Connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("[LiveCursors] Disconnected:", reason);
      setIsConnected(false);
    });

    // Receive current users when joining
    socket.on("current-users", (users: CursorData[]) => {
      console.log("[LiveCursors] Current users:", users);
      setCursors(new Map(users.map((u) => [u.odId, u])));
    });

    // New user joined
    socket.on("user-joined", (user: { odId: string; odName: string; odColor: string }) => {
      console.log(`[LiveCursors] ${user.odName} joined the board`);
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
      console.log("[LiveCursors] User left:", data.odId);
      setCursors((prev) => {
        const next = new Map(prev);
        next.delete(data.odId);
        return next;
      });
    });

    return () => {
      console.log("[LiveCursors] Cleaning up...");
      socket.emit("leave-board");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [boardId, odId, userName, userColor, enabled]);

  // Send cursor position (throttled)
  const lastSentRef = useRef<number>(0);
  const updateCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      // Throttle to ~30fps (33ms)
      if (now - lastSentRef.current < 33) return;
      lastSentRef.current = now;

      if (socketRef.current?.connected) {
        socketRef.current.emit("cursor-move", { x, y });
      }
    },
    []
  );

  return {
    cursors: Array.from(cursors.values()).filter((c) => c.odId !== odId),
    isConnected,
    updateCursor,
    userColor,
    onlineCount: cursors.size + 1, // Include self
  };
}

