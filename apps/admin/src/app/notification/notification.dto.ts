import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const NotificationEnum = z.enum(
  [
    'WELCOME',
    'BOOKING_CREATED',
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED',
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'CHECK_IN_REMINDER',
    'CHECK_OUT_REMINDER',
    'REFUND_PROCESSED',
    'REVIEW_REQUEST',
    'PROMO_AVAILABLE',
    'SYSTEM_ANNOUNCEMENT',
    'COMPLAINT_UPDATE',
  ],
  { message: 'Error.InvalidNotificationType' }
);

export class GetManyNotificationsQueryDTO extends createZodDto(
  z
    .object({
      userId: z.string().uuid({ message: 'Error.InvalidId' }),
    })
    .extend(PaginationQuerySchema.shape)
) {}

export class GetNotificationQueryDTO extends createZodDto(
  z.object({
    userId: z.string().uuid({ message: 'Error.InvalidId' }),
    id: z.string().uuid({ message: 'Error.InvalidId' }),
  })
) {}

export class DeleteNotificationQueryDTO extends GetNotificationQueryDTO {}

export class MarkAsReadRequestDTO extends createZodDto(
  z.object({
    notificationIds: z
      .array(z.string().uuid({ message: 'Error.InvalidId' }))
      .min(1),
  })
) {}

export class CreateNotificationRequestDTO extends createZodDto(
  z.object({
    userId: z.string().uuid({ message: 'Error.InvalidId' }),
    title: z.string({ message: 'Error.InvalidTitle' }),
    content: z.string({ message: 'Error.InvalidContent' }),
    type: NotificationEnum,
  })
) {}
