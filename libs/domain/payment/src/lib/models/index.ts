import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { PaymentValidator } from '../validators';

export const GetManyPaymentsRequest = PaymentValidator.pick({
  userId: true,
  type: true,
  status: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyPaymentsResponse = z.object({
  payments: z.array(PaymentValidator),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetPaymentRequest = PaymentValidator.pick({
  id: true,
});

export const GetPaymentResponse = PaymentValidator;

export const WebhookPaymentRequest = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string().nullable(),
  code: z.string().nullable(),
  content: z.string().nullable(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().nullable(),
  referenceCode: z.string().nullable(),
  description: z.string(),
});

export const CreatePaymentRequest = PaymentValidator.pick({
  id: true,
  userId: true,
  bookingId: true,
  rentalId: true,
  type: true,
  amount: true,
});

export const UpdateStatusPaymentRequest = PaymentValidator.pick({
  id: true,
  status: true,
});

export type GetManyPaymentsRequest = z.infer<typeof GetManyPaymentsRequest>;
export type GetManyPaymentsResponse = z.infer<typeof GetManyPaymentsResponse>;
export type GetPaymentRequest = z.infer<typeof GetPaymentRequest>;
export type GetPaymentResponse = z.infer<typeof GetPaymentResponse>;
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequest>;
export type UpdateStatusPaymentRequest = z.infer<
  typeof UpdateStatusPaymentRequest
>;
export type WebhookPaymentRequest = z.infer<typeof WebhookPaymentRequest>;
