import { initTRPC, TRPCError } from "@trpc/server";
import type { Request, Response } from "express";
import type { Session, User } from "lucia";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "../db/index.js";

export interface Context {
  req: Request;
  res: Response;
  db: typeof db;
  session: Session | null;
  user: User | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  });
});
