import { z } from 'zod';

export const BookingStatusValues = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export const BookingStatusEnum = z.enum([
  BookingStatusValues.PENDING,
  BookingStatusValues.PAID,
  BookingStatusValues.ONGOING,
  BookingStatusValues.COMPLETED,
  BookingStatusValues.CANCELLED,
  BookingStatusValues.EXPIRED,
]);

export const CheckTypeEnumValues = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
} as const;

export const CheckTypeEnum = z.enum([
  CheckTypeEnumValues.CHECK_IN,
  CheckTypeEnumValues.CHECK_OUT,
]);

export const PaymentStatusValues = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;

export const PaymentStatusEnum = z.enum([
  PaymentStatusValues.PENDING,
  PaymentStatusValues.PAID,
  PaymentStatusValues.PARTIALLY_PAID,
  PaymentStatusValues.REFUNDED,
  PaymentStatusValues.FAILED,
]);

export const HistoryActionValues = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
} as const;

export const HistoryActionEnum = z.enum([
  HistoryActionValues.CREATED,
  HistoryActionValues.PAID,
  HistoryActionValues.CHECKED_IN,
  HistoryActionValues.CHECKED_OUT,
  HistoryActionValues.CANCELLED,
]);

export const ExtensionStatusEnumValues = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const ExtensionStatusEnum = z.enum([
  ExtensionStatusEnumValues.PENDING,
  ExtensionStatusEnumValues.APPROVED,
  ExtensionStatusEnumValues.REJECTED,
]);

export type BookingStatus = z.infer<typeof BookingStatusEnum>;
export type CheckType = z.infer<typeof CheckTypeEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type HistoryAction = z.infer<typeof HistoryActionEnum>;
export type ExtensionStatus = z.infer<typeof ExtensionStatusEnum>;
