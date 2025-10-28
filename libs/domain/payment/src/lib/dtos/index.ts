import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreatePaymentRequest,
  CreateRefundRequest,
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  GetRefundRequest,
  GetRefundResponse,
  UpdateRefundStatusRequest,
  UpdateStatusPaymentRequest,
  WebhookPaymentRequest,
} from '../models';

export class WebhookPaymentRequestDTO extends createZodDto(
  WebhookPaymentRequest.extend({
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
  GetManyPaymentsRequest
) {}
export class GetManyPaymentsResponseDTO extends createZodDto(
  GetManyPaymentsResponse
) {}
export class GetPaymentRequestDTO extends createZodDto(GetPaymentRequest) {}
export class GetPaymentResponseDTO extends createZodDto(GetPaymentResponse) {}
export class CreatePaymentRequestDTO extends createZodDto(
  CreatePaymentRequest
) {}
export class UpdateStatusPaymentRequestDTO extends createZodDto(
  UpdateStatusPaymentRequest
) {}
export class GetRefundRequestDTO extends createZodDto(GetRefundRequest) {}
export class GetRefundResponseDTO extends createZodDto(GetRefundResponse) {}
export class GetManyRefundsRequestDTO extends createZodDto(
  GetManyRefundsRequest
) {}
export class GetManyRefundsResponseDTO extends createZodDto(
  GetManyRefundsResponse
) {}
export class UpdateRefundStatusRequestDTO extends createZodDto(
  UpdateRefundStatusRequest
) {}
export class CreateRefundRequestDTO extends createZodDto(CreateRefundRequest) {}
