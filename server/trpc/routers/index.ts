import { router } from "../trpc";
import { authRouter } from "./auth";
import { boardsRouter } from "./boards";

export const appRouter = router({
  auth: authRouter,
  boards: boardsRouter,
});

export type AppRouter = typeof appRouter;
