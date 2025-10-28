import { z } from 'zod';

export const BookingStatusValues = {
  PENDING: 'PENDING',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  FULLY_PAID: 'FULLY_PAID',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  OVERDUE: 'OVERDUE',
} as const;

export const BookingStatusEnum = z.enum([
  BookingStatusValues.PENDING,
  BookingStatusValues.DEPOSIT_PAID,
  BookingStatusValues.FULLY_PAID,
  BookingStatusValues.ONGOING,
  BookingStatusValues.COMPLETED,
  BookingStatusValues.CANCELLED,
  BookingStatusValues.EXPIRED,
  BookingStatusValues.OVERDUE,
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
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;

export const PaymentStatusEnum = z.enum([
  PaymentStatusValues.PENDING,
  PaymentStatusValues.PAID,
  PaymentStatusValues.REFUNDED,
  PaymentStatusValues.FAILED,
]);

export const HistoryActionValues = {
  CREATED: 'CREATED',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  FULLY_PAID: 'FULLY_PAID',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  EXTENSION_REQUESTED: 'EXTENSION_REQUESTED',
  EXTENSION_APPROVED: 'EXTENSION_APPROVED',
} as const;

export const HistoryActionEnum = z.enum([
  HistoryActionValues.CREATED,
  HistoryActionValues.DEPOSIT_PAID,
  HistoryActionValues.FULLY_PAID,
  HistoryActionValues.CHECKED_IN,
  HistoryActionValues.CHECKED_OUT,
  HistoryActionValues.CANCELLED,
  HistoryActionValues.REFUNDED,
  HistoryActionValues.EXTENSION_REQUESTED,
  HistoryActionValues.EXTENSION_APPROVED,
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
