import { router } from "../trpc.js";
import { authRouter } from "./auth.js";
import { boardsRouter } from "./boards.js";
import { elementsRouter } from "./elements.js";

export const appRouter = router({
  auth: authRouter,
  boards: boardsRouter,
  elements: elementsRouter,
});

export type AppRouter = typeof appRouter;
