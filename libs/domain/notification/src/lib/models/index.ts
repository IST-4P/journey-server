import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { NotificationValidatorSchema } from '../validators';

export const GetManyNotificationsRequestSchema =
  NotificationValidatorSchema.pick({
    userId: true,
  }).extend(PaginationQuerySchema.shape);

export const GetManyNotificationsResponseSchema = z.object({
  notifications: z.array(
    NotificationValidatorSchema.pick({
      id: true,
      title: true,
      type: true,
      read: true,
      createdAt: true,
    })
  ),
});

export const GetNotificationRequestSchema = NotificationValidatorSchema.pick({
  id: true,
  userId: true,
});

export const GetNotificationResponseSchema = NotificationValidatorSchema;

export const CreateNotificationRequestSchema = NotificationValidatorSchema.pick(
  {
    userId: true,
    type: true,
    title: true,
    content: true,
  }
);

export const DeleteNotificationRequestSchema = NotificationValidatorSchema.pick(
  {
    id: true,
    userId: true,
  }
);

export const MarkAsReadRequestSchema = z.object({
  userId: z.string().uuid(),
  notificationIds: z
    .array(z.string().uuid())
    .min(1, 'At least one notification ID is required'),
});

export type GetManyNotificationsRequest = z.infer<
  typeof GetManyNotificationsRequestSchema
>;
export type GetManyNotificationsResponse = z.infer<
  typeof GetManyNotificationsResponseSchema
>;
export type GetNotificationRequest = z.infer<
  typeof GetNotificationRequestSchema
>;
export type GetNotificationResponse = z.infer<
  typeof GetNotificationResponseSchema
>;
export type CreateNotificationRequest = z.infer<
  typeof CreateNotificationRequestSchema
>;
export type DeleteNotificationRequest = z.infer<
  typeof DeleteNotificationRequestSchema
>;
export type MarkAsReadRequest = z.infer<typeof MarkAsReadRequestSchema>;
