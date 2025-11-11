import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { PaymentValidator, RefundValidator } from '../validators';

export const GetManyPaymentsRequestSchema = PaymentValidator.pick({
  userId: true,
  type: true,
  status: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyPaymentsResponseSchema = z.object({
  payments: z.array(PaymentValidator),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetPaymentRequestSchema = PaymentValidator.pick({
  id: true,
  userId: true,
});

export const GetPaymentResponseSchema = PaymentValidator;

export const WebhookPaymentRequestSchema = z.object({
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

export const CreatePaymentRequestSchema = PaymentValidator.pick({
  id: true,
  userId: true,
  bookingId: true,
  rentalId: true,
  type: true,
  amount: true,
});

export const UpdateStatusPaymentRequestSchema = PaymentValidator.pick({
  id: true,
  userId: true,
  status: true,
});

export const GetRefundRequestSchema = RefundValidator.pick({
  id: true,
});

export const GetRefundResponseSchema = RefundValidator;

export const GetManyRefundsRequestSchema = RefundValidator.pick({
  status: true,
  userId: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyRefundsResponseSchema = z.object({
  refunds: z.array(RefundValidator),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const UpdateRefundStatusRequestSchema = RefundValidator.pick({
  id: true,
  status: true,
});

export const CreateRefundRequestSchema = RefundValidator.pick({
  id: true,
  userId: true,
  bookingId: true,
  rentalId: true,
  amount: true,
  principal: true,
  penaltyAmount: true,
  damageAmount: true,
  overtimeAmount: true,
});

export type GetManyPaymentsRequest = z.infer<
  typeof GetManyPaymentsRequestSchema
>;
export type GetManyPaymentsResponse = z.infer<
  typeof GetManyPaymentsResponseSchema
>;
export type GetPaymentRequest = z.infer<typeof GetPaymentRequestSchema>;
export type GetPaymentResponse = z.infer<typeof GetPaymentResponseSchema>;
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
export type UpdateStatusPaymentRequest = z.infer<
  typeof UpdateStatusPaymentRequestSchema
>;
export type WebhookPaymentRequest = z.infer<typeof WebhookPaymentRequestSchema>;
export type GetRefundRequest = z.infer<typeof GetRefundRequestSchema>;
export type GetRefundResponse = z.infer<typeof GetRefundResponseSchema>;
export type GetManyRefundsRequest = z.infer<typeof GetManyRefundsRequestSchema>;
export type GetManyRefundsResponse = z.infer<
  typeof GetManyRefundsResponseSchema
>;
export type UpdateRefundStatusRequest = z.infer<
  typeof UpdateRefundStatusRequestSchema
>;
export type CreateRefundRequest = z.infer<typeof CreateRefundRequestSchema>;
