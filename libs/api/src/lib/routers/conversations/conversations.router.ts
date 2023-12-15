import { prisma } from "@org/db";
import { createTRPCRouter, trpcProcedures } from "../../api";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { EventEmitter } from "events";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const messageSelect = {
  id: true,
  content: true,
  createdAt: true,
  readAt: true,
  sender: {
    select: {
      id: true,
      email: true,
    },
  },
  recipient: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.MessageSelect;
type Message = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

type AddResponse = {
  message: Message;
  destinataries: [email1: string, email2: string];
};
type MyEvents = {
  add: (data: AddResponse) => void;
  markAsRead: (data: { messageId: Message["id"]; readAt: NonNullable<Message["readAt"]> }) => void;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unsafe-declaration-merging
declare interface MyEventEmitter {
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  emit<TEv extends keyof MyEvents>(event: TEv, ...args: Parameters<MyEvents[TEv]>): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class MyEventEmitter extends EventEmitter {}

const eventEmitter = new MyEventEmitter();

export const conversationsRouter = createTRPCRouter({
  getAll: trpcProcedures.protected.query(async ({ ctx }) => {
    const conversations = await prisma.$queryRaw<
      Array<{
        content: string;
        read_at: Date;
        created_at: Date;
        partnerEmail: string;
        unreadCount: number;
      }>
    >`
    SELECT 
      "content", 
      "read_at", 
      "messages"."created_at", 
    CASE 
      WHEN "senderId" = ${ctx.userId} THEN "recipient"."email" 
      ELSE "sender"."email" 
    END AS "partnerEmail",
    (
      SELECT COUNT(*)::INTEGER
      FROM "messages" as "unread_messages"
      WHERE 
        "unread_messages"."read_at" IS NULL AND
        "unread_messages"."recipientId" = ${ctx.userId} AND
        (
          ("unread_messages"."senderId" = "messages"."senderId" AND "unread_messages"."recipientId" = "messages"."recipientId") OR
          ("unread_messages"."senderId" = "messages"."recipientId" AND "unread_messages"."recipientId" = "messages"."senderId")
        )
    ) AS "unreadCount"
    FROM 
      "messages" 
    JOIN 
      "users" AS "sender" ON "messages"."senderId" = "sender"."id" 
    JOIN 
      "users" AS "recipient" ON "messages"."recipientId" = "recipient"."id" 
    WHERE 
      "senderId" = ${ctx.userId} OR "recipientId" = ${ctx.userId} 
    ORDER BY 
      "messages"."created_at" DESC
  `;

    const groupedConversations = Object.values(
      conversations.reduce((acc, message) => {
        if (
          acc[message.partnerEmail] === undefined ||
          acc[message.partnerEmail].created_at < message.created_at
        ) {
          acc[message.partnerEmail] = message;
        }

        return acc;
      }, {} as Record<string, (typeof conversations)[0]>),
    );
    return groupedConversations;
  }),

  infinite: trpcProcedures.protected
    .input(
      z.object({
        cursor: z.date().nullish(),
        take: z.number().min(1).max(50).nullish(),
        otherUserEmail: z.string().email(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const take = input.take ?? 15;
      const cursor = input.cursor ?? null;

      const otherUser = await prisma.user.findUnique({
        where: { email: input.otherUserEmail },
      });

      if (otherUser === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          AND: [
            {
              OR: [
                { senderId: ctx.userId, recipientId: otherUser.id },
                { senderId: otherUser.id, recipientId: ctx.userId },
              ],
            },
            cursor !== null ? { createdAt: { lt: cursor } } : {},
          ],
        },
        take,
        select: messageSelect,
        orderBy: { createdAt: "desc" },
      });

      const prevCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null;

      return {
        messages,
        prevCursor,
      };
    }),

  sendMessage: trpcProcedures.protected
    .input(
      z.object({
        recipientEmail: z.string().email(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const recipient = await prisma.user.findUnique({
        where: {
          email: input.recipientEmail,
        },
        select: {
          id: true,
        },
      });

      if (recipient === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipient not found",
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          content: input.content,
          senderId: ctx.userId,
          recipientId: recipient?.id,
          readAt: null,
        },
        select: messageSelect,
      });

      eventEmitter.emit("add", {
        message: newMessage,
        destinataries: [ctx.userEmail, input.recipientEmail],
      });

      return newMessage;
    }),

  onAdd: trpcProcedures.protected.subscription(() => {
    return observable<AddResponse>((emit) => {
      const onAdd = (data: AddResponse): void => {
        emit.next(data);
      };
      eventEmitter.on("add", onAdd);
      return () => {
        eventEmitter.off("add", onAdd);
      };
    });
  }),

  markAsRead: trpcProcedures.protected
    .input(
      z.object({
        messageId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const message = await prisma.message.findUnique({
        where: { id: input.messageId },
        select: {
          ...messageSelect,
          recipientId: true,
        },
      });

      if (message === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }

      if (message.recipientId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the recipient of this message",
        });
      }

      const updatedMessage = await prisma.message.update({
        where: { id: input.messageId },
        data: { readAt: new Date() },
        select: messageSelect,
      });

      eventEmitter.emit("markAsRead", {
        messageId: updatedMessage.id,
        readAt: updatedMessage.readAt as Date,
      });

      return updatedMessage;
    }),

  onMarkAsRead: trpcProcedures.protected.subscription(() => {
    return observable<{ messageId: string; readAt: Date }>((emit) => {
      const onMarkAsRead = (data: { messageId: string; readAt: Date }): void => {
        emit.next(data);
      };
      eventEmitter.on("markAsRead", onMarkAsRead);
      return () => {
        eventEmitter.off("markAsRead", onMarkAsRead);
      };
    });
  }),
});
