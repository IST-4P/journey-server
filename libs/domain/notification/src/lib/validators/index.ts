import { z } from 'zod';
import { NotificationTypeEnum } from '../enums';

export const NotificationValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeEnum,
  title: z.string(),
  content: z.string(),
  read: z.boolean(),
  bookingId: z.string().uuid().nullish(),
  vehicleId: z.string().uuid().nullish(),
  paymentId: z.string().uuid().nullish(),
  createdAt: z.date(),
});

export type NotificationValidator = z.infer<typeof NotificationValidatorSchema>;
