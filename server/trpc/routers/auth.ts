import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { lucia } from "@server/auth/lucia";
import { hash, verify } from "@server/lib/password";
import { generateIdFromEntropySize } from "lucia";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.db.users.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    const passwordHash = await hash(input.password);
    const userId = generateIdFromEntropySize(10);

    const user = await ctx.db.users.create({
      data: {
        id: userId,
        email: input.email,
        name: input.name,
        password_hash: passwordHash,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.users.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const validPassword = await verify(user.password_hash, input.password);
    if (!validPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await lucia.invalidateSession(ctx.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    ctx.res.setHeader("Set-Cookie", sessionCookie.serialize());
    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
    };
  }),
});
