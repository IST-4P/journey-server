import z from 'zod';

export const PaymentStatusValues = {
  PENDING: 'PENDING', // Chờ thanh toán
  PAID: 'PAID', // Đã thanh toán
  FAILED: 'FAILED', // Thanh toán thất bại
} as const;

export const PaymentStatusEnum = z.enum([
  PaymentStatusValues.PENDING,
  PaymentStatusValues.PAID,
  PaymentStatusValues.FAILED,
]);

export const PaymentTypeValues = {
  DEVICE: 'DEVICE', // Thiết bị
  COMBO: 'COMBO', // Combo
  VEHICLE: 'VEHICLE', // Phương tiện
  EXTENSION: 'EXTENSION', // Gia hạn
} as const;

export const PaymentTypeEnum = z.enum([
  PaymentTypeValues.DEVICE,
  PaymentTypeValues.VEHICLE,
  PaymentTypeValues.COMBO,
  PaymentTypeValues.EXTENSION,
]);

export const RefundStatusValues = {
  PENDING: 'PENDING', // Chờ hoàn tiền
  COMPLETED: 'COMPLETED', // Hoàn tiền thành công
  CANCELLED: 'CANCELLED', // Hoàn tiền bị hủy
} as const;

export const RefundStatusEnum = z.enum([
  RefundStatusValues.PENDING,
  RefundStatusValues.COMPLETED,
  RefundStatusValues.CANCELLED,
]);

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
export type RefundStatus = z.infer<typeof RefundStatusEnum>;
