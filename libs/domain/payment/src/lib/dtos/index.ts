import { createZodDto } from 'nestjs-zod';
import {
  CreatePaymentRequest,
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  UpdateStatusPaymentRequest,
  WebhookPaymentRequest,
} from '../models';

export class WebhookPaymentRequestDTO extends createZodDto(
  WebhookPaymentRequest
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
