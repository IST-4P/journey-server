import { createZodDto } from 'nestjs-zod';
import {
  CreateHistoryRequestSchema,
  GetHistoryRequestSchema,
  GetHistoryResponseSchema,
  GetManyHistoriesRequestSchema,
  GetManyHistoriesResponseSchema,
} from '../models';

export class GetManyHistoriesRequestDTO extends createZodDto(
  GetManyHistoriesRequestSchema
) {}
export class GetManyHistoriesResponseDTO extends createZodDto(
  GetManyHistoriesResponseSchema
) {}
export class GetHistoryRequestDTO extends createZodDto(
  GetHistoryRequestSchema
) {}
export class GetHistoryResponseDTO extends createZodDto(
  GetHistoryResponseSchema
) {}
export class CreateHistoryRequestDTO extends createZodDto(
  CreateHistoryRequestSchema
) {}
