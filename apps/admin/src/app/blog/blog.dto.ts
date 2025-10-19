import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
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

export class CreateBlogRequestDTO extends createZodDto(
  z.object({
    title: z.string({
      message: 'Error.InvalidTitle',
      required_error: 'Error.TitleRequired',
    }),
    content: z.string({
      message: 'Error.InvalidContent',
      required_error: 'Error.ContentRequired',
    }),
    type: z.string({
      message: 'Error.InvalidType',
      required_error: 'Error.TypeRequired',
    }),
    region: z.string({
      message: 'Error.InvalidRegion',
      required_error: 'Error.RegionRequired',
    }),
    thumbnail: z.string().url({
      message: 'Error.InvalidThumbnail',
    }),
  })
) {}

export class UpdateBlogRequestDTO extends createZodDto(
  z.object({
    blogId: z.string().uuid({
      message: 'Error.InvalidBlogId',
    }),
    title: z
      .string({
        message: 'Error.InvalidTitle',
        required_error: 'Error.TitleRequired',
      })
      .optional(),
    content: z
      .string({
        message: 'Error.InvalidContent',
        required_error: 'Error.ContentRequired',
      })
      .optional(),
    type: z
      .string({
        message: 'Error.InvalidType',
        required_error: 'Error.TypeRequired',
      })
      .optional(),
    region: z
      .string({
        message: 'Error.InvalidRegion',
        required_error: 'Error.RegionRequired',
      })
      .optional(),
    thumbnail: z
      .string()
      .url({
        message: 'Error.InvalidThumbnail',
      })
      .optional(),
  })
) {}

export class DeleteBlogRequestDTO extends GetBlogRequestDTO {}
