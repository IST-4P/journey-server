import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ChatValidatorSchema } from '../validators';

export const GetChatResponseSchema = ChatValidatorSchema;

export const GetChatsRequestSchema = PaginationQuerySchema.extend({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
});

export const GetChatsResponseSchema = z.object({
  chats: z.array(ChatValidatorSchema),
});

export const CreateChatRequestSchema = ChatValidatorSchema.pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

export type GetChatResponse = z.infer<typeof GetChatResponseSchema>;
export type GetChatsRequest = z.infer<typeof GetChatsRequestSchema>;
export type GetChatsResponse = z.infer<typeof GetChatsResponseSchema>;
export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;
