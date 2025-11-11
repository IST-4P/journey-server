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

  getManyPayments(
    data: PaymentProto.GetManyPaymentsRequest
  ): Promise<PaymentProto.GetManyPaymentsResponse> {
    return lastValueFrom(this.chatService.getManyPayments(data));
  }

  getPayment(
    data: PaymentProto.GetPaymentAdminRequest
  ): Promise<PaymentProto.GetPaymentResponse> {
    return lastValueFrom(this.chatService.getPaymentAdmin(data));
  }

  getRefund(
    data: PaymentProto.GetRefundAdminRequest
  ): Promise<PaymentProto.GetRefundResponse> {
    return lastValueFrom(this.chatService.getRefundAdmin(data));
  }

  getManyRefunds(
    data: PaymentProto.GetManyRefundsRequest
  ): Promise<PaymentProto.GetManyRefundsResponse> {
    return lastValueFrom(this.chatService.getManyRefunds(data));
  }

  updateRefundStatus(
    data: PaymentProto.UpdateRefundStatusRequest
  ): Promise<PaymentProto.GetRefundResponse> {
    return lastValueFrom(this.chatService.updateRefundStatus(data));
  }
}
