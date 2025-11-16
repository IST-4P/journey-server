import { createZodDto } from 'nestjs-zod';
import {
  CreateBlogRequestSchema,
  DeleteBlogRequestSchema,
  GetBlogRequestSchema,
  GetBlogResponseSchema,
  GetManyBlogsRequestSchema,
  GetManyBlogsResponseSchema,
  UpdateBlogRequestSchema,
} from '../models';

export class GetManyBlogsRequestDTO extends createZodDto(
  GetManyBlogsRequestSchema
) {}
export class GetManyBlogsResponseDTO extends createZodDto(
  GetManyBlogsResponseSchema
) {}
export class GetBlogRequestDTO extends createZodDto(GetBlogRequestSchema) {}
export class GetBlogResponseDTO extends createZodDto(GetBlogResponseSchema) {}
export class CreateBlogRequestDTO extends createZodDto(
  CreateBlogRequestSchema
) {}
export class UpdateBlogRequestDTO extends createZodDto(
  UpdateBlogRequestSchema.omit({ id: true })
) {}
export class DeleteBlogRequestDTO extends createZodDto(
  DeleteBlogRequestSchema
) {}
