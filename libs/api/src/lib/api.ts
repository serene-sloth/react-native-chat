import { TRPCError, initTRPC } from "@trpc/server";
import type * as trpcExpress from "@trpc/server/adapters/express";
import { Logger } from "./logger";
import { ZodError, z } from "zod";
import superjson from "superjson";
import { prisma } from "@org/db";
import { type NodeHTTPCreateContextFnOptions } from "@trpc/server/dist/adapters/node-http";
import { type IncomingMessage } from "http";
import { type WebSocket } from "ws";
import { parse as parseCookie } from "cookie";

export const createTRPCContext = async (
  opts:
    | trpcExpress.CreateExpressContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, WebSocket>,
) => {
  return {
    ...opts,
  };
};
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      Logger.error(
        JSON.stringify(
          {
            message: "Request error",
            context: "TRPC",
            data: { shape, error },
          },
          null,
          2,
        ),
      );
      return {
        ...shape,
        message: "Internal server error",
      };
    }
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
  transformer: superjson,
});
export const createTRPCRouter = t.router;

const loggingMiddleware = t.middleware(async ({ path, type, next, input, meta }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  result.ok
    ? Logger.debug(
        JSON.stringify(
          {
            message: "Request timing",
            context: "TRPC",
            data: { path, type, durationMs, input, meta },
          },
          null,
          2,
        ),
      )
    : Logger.error(
        JSON.stringify(
          { message: "Request error", context: "TRPC", data: { path, type, input, meta } },
          null,
          2,
        ),
      );
  return result;
});

export const trpcProcedures = {
  public: t.procedure.use(loggingMiddleware),
  protected: t.procedure.use(
    t
      .middleware(async ({ ctx, next }) => {
        const { req } = ctx;

        let cookies;
        if ("cookies" in req) {
          // req is trpcExpress.CreateExpressContextOptions
          cookies = req.cookies;
        } else if ("headers" in req) {
          const cookieHeader = req.headers.cookie;
          if (cookieHeader !== undefined) {
            cookies = parseCookie(cookieHeader);
          }
        }

        if (cookies === null || cookies === undefined) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No cookies found",
          });
        }

        Logger.debug(
          JSON.stringify(
            {
              message: "Request cookies",
              context: "TRPC",
              data: { cookies },
            },
            null,
            2,
          ),
        );

        const sessionCookie = cookies.session as unknown;
        const sessionSchema = z.string().email().safeParse(sessionCookie);

        if (!sessionSchema.success) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No session cookie found",
          });
        }

        const user = await prisma.user.findUnique({
          where: {
            email: sessionSchema.data,
          },
          select: {
            id: true,
            email: true,
          },
        });

        if (user === null) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid session",
          });
        }

        return next({
          ctx: {
            ...ctx,
            userEmail: user.email,
            userId: user.id,
            session: sessionSchema.data,
          },
        });
      })
      .unstable_pipe(loggingMiddleware),
  ),
};
