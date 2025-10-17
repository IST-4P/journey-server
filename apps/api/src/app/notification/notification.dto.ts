import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetManyNotificationsQueryDTO extends createZodDto(
  PaginationQuerySchema
) {}

export class MarkAsReadRequestDTO extends createZodDto(
  z.object({
    notificationIds: z.array(z.uuid({ message: 'Error.InvalidId' })).min(1),
  })
) {}
