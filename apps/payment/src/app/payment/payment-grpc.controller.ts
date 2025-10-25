import { WebhookPaymentRequest } from '@domain/payment';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'Receiver')
  receiver(data: WebhookPaymentRequest): Promise<void> {
    return this.paymentService.receiver(data);
  }
}
