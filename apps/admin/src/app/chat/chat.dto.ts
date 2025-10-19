import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetChatsQueryDTO extends createZodDto(
  PaginationQuerySchema.extend({
    fromUserId: z.string().uuid({ message: 'Error.InvalidFromUserId' }),
    toUserId: z.string().uuid({ message: 'Error.InvalidToUserId' }),
  })
) {}

export class CreateChatRequestDTO extends createZodDto(
  z.object({
    fromUserId: z.string().uuid({ message: 'Error.InvalidFromUserId' }),
    toUserId: z.string().uuid({ message: 'Error.InvalidToUserId' }),
    content: z
      .string({ message: 'Error.InvalidContent' })
      .min(1, { message: 'Error.ContentCannotBeEmpty' }),
  })
) {}
