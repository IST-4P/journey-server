import { z } from 'zod';
import { BookingStatusEnum, PaymentStatusEnum } from '../enums';

export const BookingValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  status: BookingStatusEnum,

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number().int(),

  pickupAddress: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),

  vehicleFeeHour: z.number().int(),
  rentalFee: z.number().int(),
  insuranceFee: z.number().int(),
  vat: z.number().int(),
  discount: z.number().int(),
  deposit: z.number().int(),
  collateral: z.number().int(),
  totalAmount: z.number().int(),
  refundAmount: z.number().int(),

  penaltyAmount: z.number().int(),
  damageAmount: z.number().int(),
  overtimeAmount: z.number().int(),

  paymentStatus: PaymentStatusEnum,
  paidAt: z.coerce.date().nullable(),

  notes: z.string().nullable(),
  cancelReason: z.string().nullable(),
  adminNotes: z.string().nullable(),
  damageReported: z.boolean(),

  createdAt: z.date(),
  updatedAt: z.date(),
  cancelledAt: z.coerce.date().nullable(),
  expiredAt: z.coerce.date().nullable(),
});

export type BookingValidator = z.infer<typeof BookingValidatorSchema>;
