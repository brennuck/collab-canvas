import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/routers";
import { lucia } from "./auth/lucia";
import { db } from "./db";
import type { Context } from "./trpc/trpc";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Socket.IO for real-time features
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Track users in each board room
interface CursorData {
  odId: string;
  odName: string;
  odColor: string;
  x: number;
  y: number;
}

const boardUsers = new Map<string, Map<string, CursorData>>();

io.on("connection", (socket) => {
  console.log("[Socket.IO] New connection:", socket.id);
  
  let currentBoardId: string | null = null;
  let odId: string | null = null;
  let odName: string | null = null;
  let odColor: string | null = null;

  // Join a board room
  socket.on("join-board", (data: { boardId: string; odId: string; odName: string; odColor: string }) => {
    console.log("[Socket.IO] User joining board:", data);
    
    currentBoardId = data.boardId;
    odId = data.odId;
    odName = data.odName;
    odColor = data.odColor;

    socket.join(`board:${data.boardId}`);

    // Initialize board users map if needed
    if (!boardUsers.has(data.boardId)) {
      boardUsers.set(data.boardId, new Map());
    }

    const users = boardUsers.get(data.boardId)!;
    
    // Send current users to the new joiner BEFORE adding them
    socket.emit("current-users", Array.from(users.values()));

    // Add new user to the map with initial position (0,0)
    const newUser: CursorData = {
      odId: data.odId,
      odName: data.odName,
      odColor: data.odColor,
      x: 0,
      y: 0,
    };
    users.set(data.odId, newUser);

    // Notify others that someone joined
    socket.to(`board:${data.boardId}`).emit("user-joined", {
      odId: data.odId,
      odName: data.odName,
      odColor: data.odColor,
    });

    console.log("[Socket.IO] Board users:", Array.from(users.keys()));
  });

  // Cursor movement
  socket.on("cursor-move", (data: { x: number; y: number }) => {
    if (!currentBoardId || !odId) return;

    const cursorData: CursorData = {
      odId: odId,
      odName: odName || "Anonymous",
      odColor: odColor || "#3b82f6",
      x: data.x,
      y: data.y,
    };

    // Update stored cursor position
    const users = boardUsers.get(currentBoardId);
    if (users) {
      users.set(odId, cursorData);
    }

    // Broadcast to others in the room
    socket.to(`board:${currentBoardId}`).emit("cursor-update", cursorData);
  });

  // Leave board
  socket.on("leave-board", () => {
    console.log("[Socket.IO] User leaving board:", odId);
    if (currentBoardId && odId) {
      const users = boardUsers.get(currentBoardId);
      if (users) {
        users.delete(odId);
        if (users.size === 0) {
          boardUsers.delete(currentBoardId);
        }
      }

      socket.to(`board:${currentBoardId}`).emit("user-left", { odId });
      socket.leave(`board:${currentBoardId}`);
    }
    currentBoardId = null;
    odId = null;
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("[Socket.IO] Disconnected:", socket.id);
    if (currentBoardId && odId) {
      const users = boardUsers.get(currentBoardId);
      if (users) {
        users.delete(odId);
        if (users.size === 0) {
          boardUsers.delete(currentBoardId);
        }
      }

      socket.to(`board:${currentBoardId}`).emit("user-left", { odId });
    }
  });
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Create context for each request
const createContext = async ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}): Promise<Context> => {
  // Get session from cookie
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

  if (!sessionId) {
    return { req, res, db, session: null, user: null };
  }

  const { session, user } = await lucia.validateSession(sessionId);

  // Refresh session if needed
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader("Set-Cookie", sessionCookie.serialize());
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    res.setHeader("Set-Cookie", sessionCookie.serialize());
  }

  return { req, res, db, session, user };
};

// tRPC endpoint
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
  console.log(`🔌 Socket.IO ready for real-time connections`);
});
