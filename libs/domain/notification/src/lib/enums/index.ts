import { z } from 'zod';

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
