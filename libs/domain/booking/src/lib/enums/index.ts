import { z } from 'zod';

export const BookingStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
]);

export const CheckTypeEnum = z.enum(['CHECK_IN', 'CHECK_OUT']);

export const PaymentStatusEnum = z.enum([
  'PENDING', // Chờ thanh toán
  'PAID', // Đã thanh toán
  'PARTIALLY_PAID', // Thanh toán một phần
  'REFUNDED', // Đã hoàn tiền
  'FAILED', // Thanh toán thất bại
]);

export const HistoryActionEnum = z.enum([
  'CREATED',
  'PAID',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
]);

export const ExtensionStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export type BookingStatus = z.infer<typeof BookingStatusEnum>;
export type CheckType = z.infer<typeof CheckTypeEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type HistoryAction = z.infer<typeof HistoryActionEnum>;
export type ExtensionStatus = z.infer<typeof ExtensionStatusEnum>;
