import { z } from 'zod';

export const MessageResponseSchema = z.object({
  message: z.string().optional(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
