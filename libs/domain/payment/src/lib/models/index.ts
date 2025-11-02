import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { PaymentValidator, RefundValidator } from '../validators';

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
  userId: true,
});

export const GetPaymentResponse = PaymentValidator;

export const WebhookPaymentRequest = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string().nullish(),
  code: z.string().nullish(),
  content: z.string().nullish(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().nullish(),
  referenceCode: z.string().nullish(),
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
  userId: true,
  status: true,
});

export const GetRefundRequest = RefundValidator.pick({
  id: true,
});

export const GetRefundResponse = RefundValidator;

export const GetManyRefundsRequest = RefundValidator.pick({
  status: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyRefundsResponse = z.object({
  refunds: z.array(RefundValidator),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const UpdateRefundStatusRequest = RefundValidator.pick({
  id: true,
  status: true,
});

export const CreateRefundRequest = RefundValidator.pick({
  id: true,
  userId: true,
  paymentId: true,
  bookingId: true,
  rentalId: true,
  amount: true,
  penaltyAmount: true,
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
export type GetRefundRequest = z.infer<typeof GetRefundRequest>;
export type GetRefundResponse = z.infer<typeof GetRefundResponse>;
export type GetManyRefundsRequest = z.infer<typeof GetManyRefundsRequest>;
export type GetManyRefundsResponse = z.infer<typeof GetManyRefundsResponse>;
export type UpdateRefundStatusRequest = z.infer<
  typeof UpdateRefundStatusRequest
>;
export type CreateRefundRequest = z.infer<typeof CreateRefundRequest>;
