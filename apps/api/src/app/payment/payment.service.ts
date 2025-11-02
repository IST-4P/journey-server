import { PaymentProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private chatService!: PaymentProto.PaymentServiceClient;

  constructor(
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME)
    private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.chatService =
      this.client.getService<PaymentProto.PaymentServiceClient>(
        PaymentProto.PAYMENT_SERVICE_NAME
      );
  }

  receiver(
    data: PaymentProto.WebhookPaymentRequest
  ): Promise<PaymentProto.WebhookPaymentResponse> {
    return lastValueFrom(this.chatService.receiver(data));
  }

  getManyPayments(
    data: PaymentProto.GetManyPaymentsRequest
  ): Promise<PaymentProto.GetManyPaymentsResponse> {
    return lastValueFrom(this.chatService.getManyPayments(data));
  }

  getPayment(
    data: PaymentProto.GetPaymentRequest
  ): Promise<PaymentProto.GetPaymentResponse> {
    return lastValueFrom(this.chatService.getPayment(data));
  }
}
