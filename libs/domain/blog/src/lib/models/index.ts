import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { BlogValidatorSchema } from '../validators';

export const GetManyBlogsRequestSchema = BlogValidatorSchema.pick({
  title: true,
  type: true,
  region: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyBlogsResponseSchema = z.object({
  blogs: z.array(BlogValidatorSchema.omit({ content: true })),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetBlogRequestSchema = BlogValidatorSchema.pick({
  id: true,
});

export const GetBlogResponseSchema = BlogValidatorSchema;

export const CreateBlogRequestSchema = BlogValidatorSchema.pick({
  title: true,
  content: true,
  type: true,
  region: true,
  thumbnail: true,
  tag: true,
  summary: true,
});

export const UpdateBlogResponseSchema =
  CreateBlogRequestSchema.partial().extend({
    id: BlogValidatorSchema.shape.id,
  });

export const DeleteBlogRequestSchema = BlogValidatorSchema.pick({
  id: true,
});

export type GetManyBlogsRequest = z.infer<typeof GetManyBlogsRequestSchema>;
export type GetManyBlogsResponse = z.infer<typeof GetManyBlogsResponseSchema>;
export type GetBlogRequest = z.infer<typeof GetBlogRequestSchema>;
export type GetBlogResponse = z.infer<typeof GetBlogResponseSchema>;
export type CreateBlogRequest = z.infer<typeof CreateBlogRequestSchema>;
export type UpdateBlogRequest = z.infer<typeof UpdateBlogResponseSchema>;
export type DeleteBlogRequest = z.infer<typeof DeleteBlogRequestSchema>;
