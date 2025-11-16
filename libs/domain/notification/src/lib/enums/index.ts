import { z } from 'zod';

export const NotificationTypeValues = {
  WELCOME: 'WELCOME',
  BOOKING: 'BOOKING',
  RENTAL: 'RENTAL',
  SYSTEM: 'SYSTEM',
  PROMOTION: 'PROMOTION',
  COMPLAINT: 'COMPLAINT',
} as const;

export const NotificationTypeEnum = z.enum([
  NotificationTypeValues.WELCOME,
  NotificationTypeValues.BOOKING,
  NotificationTypeValues.RENTAL,
  NotificationTypeValues.SYSTEM,
  NotificationTypeValues.PROMOTION,
  NotificationTypeValues.COMPLAINT,
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;
