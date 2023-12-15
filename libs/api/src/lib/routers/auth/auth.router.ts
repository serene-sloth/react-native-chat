import { prisma } from "@org/db";
import { createTRPCRouter, trpcProcedures } from "../../api";
import { loginInput } from "@org/api-contracts";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

const userSelect = {
  id: true,
  email: true,
} satisfies Prisma.UserSelect;

export const authRouter = createTRPCRouter({
  login: trpcProcedures.public.input(loginInput).mutation(async ({ input, ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: userSelect,
    });

    if (user === null) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid email or password",
      });
    }

    if ("cookie" in ctx.res) {
      ctx.res.cookie("session", input.email);
    }
    return {
      user,
    };
  }),

  me: trpcProcedures.protected.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: {
        email: ctx.session,
      },
      select: userSelect,
    });

    if (user === null) {
      if ("clearCookie" in ctx.res) {
        ctx.res.clearCookie("session");
      }
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid session",
      });
    }

    return {
      user,
    };
  }),

  signOut: trpcProcedures.protected.mutation(({ ctx }) => {
    if ("clearCookie" in ctx.res) {
      ctx.res.clearCookie("session");
    }
    return {
      ok: true,
    };
  }),
});
