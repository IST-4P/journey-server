import { createZodDto } from 'nestjs-zod';
import {
  CreateComplaintMessageRequestSchema,
  GetManyComplaintMessagesRequestSchema,
  GetManyComplaintMessagesResponseSchema,
} from '../models';

export class CreateComplaintMessageRequestDTO extends createZodDto(
  CreateComplaintMessageRequestSchema
) {}

export class GetManyComplaintMessagesRequestDTO extends createZodDto(
  GetManyComplaintMessagesRequestSchema
) {}

export class GetManyComplaintMessagesResponseDTO extends createZodDto(
  GetManyComplaintMessagesResponseSchema
) {}
