import { createZodDto } from 'nestjs-zod';
import {
  CreateChatRequestSchema,
  GetChatsRequestSchema,
  GetChatsResponseSchema,
} from '../models';

export class GetChatsRequestDTO extends createZodDto(GetChatsRequestSchema) {}
export class GetChatsResponseDTO extends createZodDto(GetChatsResponseSchema) {}
export class CreateChatRequestDTO extends createZodDto(
  CreateChatRequestSchema
) {}
