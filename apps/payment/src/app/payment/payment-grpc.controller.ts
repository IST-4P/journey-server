import {
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  WebhookPaymentRequest,
} from '@domain/payment';
import { MessageResponse } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetPaymentAdminRequest } from 'libs/grpc/src/lib/types/proto/payment';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'Receiver')
  receiver(data: WebhookPaymentRequest): Promise<MessageResponse> {
    return this.paymentService.receiver(data);
  }

  @GrpcMethod('PaymentService', 'GetManyPayments')
  getManyPayments(
    data: GetManyPaymentsRequest
  ): Promise<GetManyPaymentsResponse> {
    return this.paymentService.getManyPayments(data);
  }

  @GrpcMethod('PaymentService', 'GetPayment')
  getPayment(data: GetPaymentRequest): Promise<GetPaymentResponse> {
    return this.paymentService.getPayment(data);
  }

  @GrpcMethod('PaymentService', 'GetPaymentAdmin')
  getPaymentAdmin(data: GetPaymentAdminRequest): Promise<GetPaymentResponse> {
    return this.paymentService.getPaymentAdmin(data);
  }
}
