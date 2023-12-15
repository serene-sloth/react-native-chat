import { conversationsRouter } from "./routers/conversations/conversations.router";
import { t } from "./api";
import { authRouter } from "./routers/auth/auth.router";

export const appRouter = t.router({
  auth: authRouter,
  conversations: conversationsRouter,
});

export type AppRouter = typeof appRouter;
