import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetChatsRequestDTO extends createZodDto(
  PaginationQuerySchema.extend({
    toUserId: z.uuid({ message: 'Error.InvalidToUserId' }),
  })
) {}

export class CreateChatRequestDTO extends createZodDto(
  z.object({
    toUserId: z.uuid({ message: 'Error.InvalidToUserId' }),
    content: z
      .string({ message: 'Error.InvalidContent' })
      .min(1, { message: 'Error.ContentCannotBeEmpty' }),
  })
) {}
