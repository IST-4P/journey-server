import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreatePaymentRequestSchema,
  CreateRefundRequestSchema,
  GetManyPaymentsRequestSchema,
  GetManyPaymentsResponseSchema,
  GetManyRefundsRequestSchema,
  GetManyRefundsResponseSchema,
  GetPaymentRequestSchema,
  GetPaymentResponseSchema,
  GetRefundRequestSchema,
  GetRefundResponseSchema,
  UpdateRefundStatusRequestSchema,
  UpdateStatusPaymentRequestSchema,
  WebhookPaymentRequestSchema,
} from '../models';

export class WebhookPaymentRequestDTO extends createZodDto(
  WebhookPaymentRequestSchema.extend({
    accountNumber: z.string().optional(),
    code: z.string().optional(),
    content: z.string().optional(),
    subAccount: z
      .string()
      .nullish()
      .transform((val) => val ?? undefined),
    referenceCode: z.string().optional(),
  })
) {}
export class GetManyPaymentsRequestDTO extends createZodDto(
  GetManyPaymentsRequestSchema
) {}
export class GetManyPaymentsResponseDTO extends createZodDto(
  GetManyPaymentsResponseSchema
) {}
export class GetPaymentRequestDTO extends createZodDto(
  GetPaymentRequestSchema
) {}
export class GetPaymentResponseDTO extends createZodDto(
  GetPaymentResponseSchema
) {}
export class CreatePaymentRequestDTO extends createZodDto(
  CreatePaymentRequestSchema
) {}
export class UpdateStatusPaymentRequestDTO extends createZodDto(
  UpdateStatusPaymentRequestSchema
) {}
export class GetRefundRequestDTO extends createZodDto(GetRefundRequestSchema) {}
export class GetRefundResponseDTO extends createZodDto(
  GetRefundResponseSchema
) {}
export class GetManyRefundsRequestDTO extends createZodDto(
  GetManyRefundsRequestSchema
) {}
export class GetManyRefundsResponseDTO extends createZodDto(
  GetManyRefundsResponseSchema
) {}
export class UpdateRefundStatusRequestDTO extends createZodDto(
  UpdateRefundStatusRequestSchema
) {}
export class CreateRefundRequestDTO extends createZodDto(
  CreateRefundRequestSchema
) {}
