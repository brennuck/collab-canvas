import { router } from "../trpc";
import { authRouter } from "./auth";
import { boardsRouter } from "./boards";
import { elementsRouter } from "./elements";

export const appRouter = router({
  auth: authRouter,
  boards: boardsRouter,
  elements: elementsRouter,
});

export type AppRouter = typeof appRouter;
