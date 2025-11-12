import { PaymentProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentService!: PaymentProto.PaymentServiceClient;

  constructor(
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME)
    private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.paymentService =
      this.client.getService<PaymentProto.PaymentServiceClient>(
        PaymentProto.PAYMENT_SERVICE_NAME
      );
  }

  getManyPayments(
    data: PaymentProto.GetManyPaymentsRequest
  ): Promise<PaymentProto.GetManyPaymentsResponse> {
    return lastValueFrom(this.paymentService.getManyPayments(data));
  }

  getPayment(
    data: PaymentProto.GetPaymentAdminRequest
  ): Promise<PaymentProto.GetPaymentResponse> {
    return lastValueFrom(this.paymentService.getPaymentAdmin(data));
  }

  getRefund(
    data: PaymentProto.GetRefundAdminRequest
  ): Promise<PaymentProto.GetRefundResponse> {
    return lastValueFrom(this.paymentService.getRefundAdmin(data));
  }

  getManyRefunds(
    data: PaymentProto.GetManyRefundsRequest
  ): Promise<PaymentProto.GetManyRefundsResponse> {
    return lastValueFrom(this.paymentService.getManyRefunds(data));
  }

  updateRefundStatus(
    data: PaymentProto.UpdateRefundStatusRequest
  ): Promise<PaymentProto.GetRefundResponse> {
    return lastValueFrom(this.paymentService.updateRefundStatus(data));
  }

  getManyTransactions(
    data: PaymentProto.GetManyTransactionsRequest
  ): Promise<PaymentProto.GetManyTransactionsResponse> {
    return lastValueFrom(this.paymentService.getManyTransactions(data));
  }

  getTransaction(
    data: PaymentProto.GetTransactionRequest
  ): Promise<PaymentProto.GetTransactionResponse> {
    return lastValueFrom(this.paymentService.getTransaction(data));
  }

  getInformationTransaction(
    data: PaymentProto.GetInformationTransactionRequest
  ): Promise<PaymentProto.GetInformationTransactionResponse> {
    return lastValueFrom(this.paymentService.getInformationTransaction(data));
  }
}
