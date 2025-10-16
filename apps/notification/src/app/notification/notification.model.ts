import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { z } from 'zod';

// ==================== BASE ENUM ====================
export const NotificationEnum = z.enum([
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
]);

export type NotificationEnumType = z.infer<typeof NotificationEnum>;

// ==================== BASE SCHEMA ====================
export const NotificationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  type: NotificationEnum,
  title: z.string(),
  content: z.string(),
  read: z.boolean(),
  bookingId: z.uuid().nullable().optional(),
  vehicleId: z.uuid().nullable().optional(),
  paymentId: z.uuid().nullable().optional(),
  createdAt: z.date(),
});

export const GetManyNotificationsRequestSchema = NotificationSchema.pick({
  userId: true,
}).extend(PaginationQuerySchema.shape);

export const GetManyNotificationsResponseSchema = NotificationSchema.pick({
  id: true,
  title: true,
  type: true,
  read: true,
  createdAt: true,
}).array();

export const GetNotificationRequestSchema = NotificationSchema.pick({
  id: true,
  userId: true,
});

export const GetNotificationResponseSchema = NotificationSchema;

export const CreateNotificationRequestSchema = NotificationSchema.pick({
  userId: true,
  type: true,
  title: true,
  content: true,
});

export const DeleteNotificationRequestSchema = NotificationSchema.pick({
  id: true,
  userId: true,
});

export const MarkAsReadRequestSchema = z.object({
  userId: z.uuid(),
  notificationIds: z
    .array(z.uuid())
    .min(1, 'At least one notification ID is required'),
});

export type GetManyNotificationsRequestType = z.infer<
  typeof GetManyNotificationsRequestSchema
>;
export type GetManyNotificationsResponseType = z.infer<
  typeof GetManyNotificationsResponseSchema
>;
export type GetNotificationRequestType = z.infer<
  typeof GetNotificationRequestSchema
>;
export type GetNotificationResponseType = z.infer<
  typeof GetNotificationResponseSchema
>;
export type CreateNotificationRequestType = z.infer<
  typeof CreateNotificationRequestSchema
>;
export type MarkAsReadRequestType = z.infer<typeof MarkAsReadRequestSchema>;
export type DeleteNotificationRequestType = z.infer<
  typeof DeleteNotificationRequestSchema
>;
