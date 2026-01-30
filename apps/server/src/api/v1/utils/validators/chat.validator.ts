import { z } from "zod";

export const chatRequestSchema = z
  .object({
    message: z.string().min(1, "message is required").trim(),
    threadId: z.string().optional(),
  })
  .transform((data) => ({
    message: data.message,
    threadId: data.threadId,
  }));

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
