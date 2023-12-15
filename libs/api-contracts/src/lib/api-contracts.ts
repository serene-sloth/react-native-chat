import { type User } from "@prisma/client";
import { z } from "zod";

export const loginInput = z.object({
  email: z.string().email(),
});
export type LoginInput = z.infer<typeof loginInput>;
export type LoginOutput = {
  user: {
    id: User["id"];
    email: User["email"];
  };
};

export type MeOutput = LoginOutput;

export const sendMessageInput = z.object({
  recipientId: z.string().uuid(),
  content: z.string().trim(),
});
export type SendMessageInput = z.infer<typeof sendMessageInput>;
