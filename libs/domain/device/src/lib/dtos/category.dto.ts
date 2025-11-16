import { createZodDto } from 'nestjs-zod';
import {
  CreateCategoryRequestSchema,
  CreateCategoryResponseSchema,
  DeleteCategoryRequestSchema,
  DeleteCategoryResponseSchema,
  GetCategoryRequestSchema,
  GetCategoryResponseSchema,
  GetManyCategoriesRequestSchema,
  GetManyCategoriesResponseSchema,
  UpdateCategoryRequestSchema,
  UpdateCategoryResponseSchema,
} from '../models/category.model';

// Category DTOs
export class GetCategoryRequestDTO extends createZodDto(
  GetCategoryRequestSchema
) {}
export class GetCategoryResponseDTO extends createZodDto(
  GetCategoryResponseSchema
) {}
export class GetManyCategoriesRequestDTO extends createZodDto(
  GetManyCategoriesRequestSchema
) {}
export class GetManyCategoriesResponseDTO extends createZodDto(
  GetManyCategoriesResponseSchema
) {}
export class CreateCategoryRequestDTO extends createZodDto(
  CreateCategoryRequestSchema
) {}
export class CreateCategoryResponseDTO extends createZodDto(
  CreateCategoryResponseSchema
) {}
export class UpdateCategoryRequestDTO extends createZodDto(
  UpdateCategoryRequestSchema
) {}
export class UpdateCategoryResponseDTO extends createZodDto(
  UpdateCategoryResponseSchema
) {}
export class DeleteCategoryRequestDTO extends createZodDto(
  DeleteCategoryRequestSchema
) {}
export class DeleteCategoryResponseDTO extends createZodDto(
  DeleteCategoryResponseSchema
) {}
