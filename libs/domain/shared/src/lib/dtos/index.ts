import { createZodDto } from 'nestjs-zod';
import { MessageResponseSchema, PaginationQuerySchema } from '../models';

export class PaginationQueryDTO extends createZodDto(PaginationQuerySchema) {}

export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}
