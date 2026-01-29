import { z } from "zod";

export const chatRequestSchema = z
  .object({
    message: z.string().min(1, "message is required").trim(),
  })
  .transform((data) => ({
    message: data.message,
  }));

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
