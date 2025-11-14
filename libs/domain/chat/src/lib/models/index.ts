import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ChatValidatorSchema } from '../validators';

export const GetChatResponseSchema = ChatValidatorSchema;

export const GetChatsRequestSchema = PaginationQuerySchema.extend({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
}).extend(PaginationQuerySchema.shape);

export const GetChatsResponseSchema = z.object({
  chats: z.array(ChatValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateChatRequestSchema = ChatValidatorSchema.pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

export const GetManyConversationsRequestSchema = z
  .object({
    adminId: z.string().uuid(),
  })
  .extend(PaginationQuerySchema.shape);

export const GetManyConversationsResponseSchema = z.object({
  conversations: z.array(z.string().uuid()),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export type GetChatResponse = z.infer<typeof GetChatResponseSchema>;
export type GetChatsRequest = z.infer<typeof GetChatsRequestSchema>;
export type GetChatsResponse = z.infer<typeof GetChatsResponseSchema>;
export type CreateChatRequest = z.infer<typeof CreateChatRequestSchema>;
export type GetManyConversationsRequest = z.infer<
  typeof GetManyConversationsRequestSchema
>;

export type GetManyConversationsResponse = z.infer<
  typeof GetManyConversationsResponseSchema
>;
