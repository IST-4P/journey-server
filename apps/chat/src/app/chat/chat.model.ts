import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { z } from 'zod';

export const ChatSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  content: z.string(),
  createdAt: z.date(),
});

export const GetChatsRequestSchema = PaginationQuerySchema.extend({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
});

export const GetChatsResponseSchema = z.object({
  chats: z.array(ChatSchema),
});

export const CreateChatRequestSchema = ChatSchema.pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

export type ChatType = z.infer<typeof ChatSchema>;
export type GetChatsRequestType = z.infer<typeof GetChatsRequestSchema>;
export type GetChatsResponseType = z.infer<typeof GetChatsResponseSchema>;
export type CreateChatRequestType = z.infer<typeof CreateChatRequestSchema>;
