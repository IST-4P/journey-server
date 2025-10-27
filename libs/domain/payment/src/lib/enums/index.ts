import z from 'zod';

export const PaymentStatusEnum = z.enum([
  'PENDING', // Chờ thanh toán
  'PAID', // Đã thanh toán
  'FAILED', // Thanh toán thất bại
]);

export const PaymentTypeEnum = z.enum([
  'DEVICE', // Thiết bị
  'VEHICLE', // Phương tiện
]);

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
