import { z } from 'zod';

export const ChatValidatorSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  content: z.string(),
  createdAt: z.date(),
});

export type ChatValidator = z.infer<typeof ChatValidatorSchema>;
