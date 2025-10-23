import { z } from 'zod';
import { PaymentStatusEnum, PaymentTypeEnum } from '../enums';

export const PaymentValidator = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: PaymentTypeEnum,
  bookingId: z.string().uuid().nullable(),
  rentalId: z.string().uuid().nullable(),
  amount: z.number().min(0),
  status: PaymentStatusEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export const PaymentTransactionValidator = z.object({
  id: z.string().uuid(),
  gateway: z.string(),
  transactionDate: z.date(),
  accountNumber: z.string().nullable(),
  subAccount: z.string().nullable(),
  amountIn: z.number(),
  amountOut: z.number(),
  accumulated: z.number(),
  code: z.string().nullable(),
  transactionContent: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  body: z.string().nullable(),
  createdAt: z.date(),
});

export type Payment = z.infer<typeof PaymentValidator>;
export type PaymentTransaction = z.infer<typeof PaymentTransactionValidator>;
