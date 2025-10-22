import { createZodDto } from 'nestjs-zod';
import {
  CreateModelRequestSchema,
  DeleteModelRequestSchema,
  GetAllModelsRequestSchema,
  GetAllModelsResponseSchema,
  UpdateModelRequestSchema,
} from '../models';

export class GetAllModelsRequestDTO extends createZodDto(
  GetAllModelsRequestSchema
) {}
export class GetAllModelsResponseDTO extends createZodDto(
  GetAllModelsResponseSchema
) {}
export class CreateModelRequestDTO extends createZodDto(
  CreateModelRequestSchema
) {}
export class UpdateModelRequestDTO extends createZodDto(
  UpdateModelRequestSchema.omit({ id: true })
) {}
export class DeleteModelRequestDTO extends createZodDto(
  DeleteModelRequestSchema
) {}
