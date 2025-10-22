import { createZodDto } from 'nestjs-zod';
import {
  CreateBrandRequestSchema,
  DeleteBrandRequestSchema,
  GetAllBrandsResponseSchema,
  UpdateBrandRequestSchema,
} from '../models';

export class GetAllBrandsResponseDTO extends createZodDto(
  GetAllBrandsResponseSchema
) {}
export class CreateBrandRequestDTO extends createZodDto(
  CreateBrandRequestSchema
) {}
export class UpdateBrandRequestDTO extends createZodDto(
  UpdateBrandRequestSchema.omit({ id: true })
) {}
export class DeleteBrandRequestDTO extends createZodDto(
  DeleteBrandRequestSchema
) {}
