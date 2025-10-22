import { PaginationQuerySchema } from '@domain/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetManyBlogsRequestDTO extends createZodDto(
  PaginationQuerySchema.extend({
    categoryId: z.string().uuid().optional(),
  })
) {}

export class GetBlogRequestDTO extends createZodDto(
  z.object({
    blogId: z
      .string({ message: 'Error.InvalidBlogId' })
      .uuid({ message: 'Error.InvalidBlogId' }),
  })
) {}
