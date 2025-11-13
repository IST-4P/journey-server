import { PaymentProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PaymentGateway } from './payment.gateway';

@Injectable()
export class PaymentService implements OnModuleInit {
  private chatService!: PaymentProto.PaymentServiceClient;

  constructor(
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly paymentGateway: PaymentGateway
  ) {}

  onModuleInit() {
    this.chatService =
      this.client.getService<PaymentProto.PaymentServiceClient>(
        PaymentProto.PAYMENT_SERVICE_NAME
      );
  }

  async receiver(
    data: PaymentProto.WebhookPaymentRequest
  ): Promise<PaymentProto.WebhookPaymentResponse> {
    const result = await lastValueFrom(this.chatService.receiver(data));
    this.paymentGateway.handlePaymentSuccess(result);
    return result;
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

  getManyRefunds(
    data: PaymentProto.GetManyRefundsRequest
  ): Promise<PaymentProto.GetManyRefundsResponse> {
    return lastValueFrom(this.chatService.getManyRefunds(data));
  }

  getRefund(
    data: PaymentProto.GetRefundRequest
  ): Promise<PaymentProto.GetRefundResponse> {
    return lastValueFrom(this.chatService.getRefund(data));
  }
}
