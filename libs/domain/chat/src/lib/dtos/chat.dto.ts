import { createZodDto } from 'nestjs-zod';
import {
  CreateChatRequestSchema,
  GetChatsRequestSchema,
  GetChatsResponseSchema,
  GetManyConversationsRequestSchema,
  GetManyConversationsResponseSchema,
} from '../models/chat.model';

export class GetChatsRequestDTO extends createZodDto(GetChatsRequestSchema) {}
export class GetChatsResponseDTO extends createZodDto(GetChatsResponseSchema) {}
export class CreateChatRequestDTO extends createZodDto(
  CreateChatRequestSchema
) {}
export class GetManyConversationsRequestDTO extends createZodDto(
  GetManyConversationsRequestSchema
) {}
export class GetManyConversationsResponseDTO extends createZodDto(
  GetManyConversationsResponseSchema
) {}
