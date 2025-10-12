import { z } from 'zod';

export const MessageResponse = z.object({
  message: z.string().optional(),
});

export type MessageResponseType = z.infer<typeof MessageResponse>;
