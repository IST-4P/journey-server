import z from 'zod';

export const RentalStatusValues = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
} as const;

export const RentalStatusEnum = z.enum([
  RentalStatusValues.PENDING,
  RentalStatusValues.ACTIVE,
  RentalStatusValues.COMPLETED,
  RentalStatusValues.CANCELLED,
  RentalStatusValues.OVERDUE,
]);

export const ExtensionStatusValues = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const ExtensionStatusEnum = z.enum([
  ExtensionStatusValues.PENDING,
  ExtensionStatusValues.APPROVED,
  ExtensionStatusValues.REJECTED,
]);

export type RentalStatus = z.infer<typeof RentalStatusEnum>;
export type ExtensionStatus = z.infer<typeof ExtensionStatusEnum>;
