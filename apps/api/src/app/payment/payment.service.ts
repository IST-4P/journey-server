import { BookingProto, PaymentProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PaymentGateway } from './payment.gateway';

@Injectable()
export class PaymentService implements OnModuleInit {
  private chatService!: PaymentProto.PaymentServiceClient;
  private bookingService!: BookingProto.BookingServiceClient;

  constructor(
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME)
    private chatClient: ClientGrpc,
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private bookingClient: ClientGrpc,
    private readonly paymentGateway: PaymentGateway
  ) {}

  onModuleInit() {
    this.chatService =
      this.chatClient.getService<PaymentProto.PaymentServiceClient>(
        PaymentProto.PAYMENT_SERVICE_NAME
      );
    this.bookingService =
      this.bookingClient.getService<BookingProto.BookingServiceClient>(
        BookingProto.BOOKING_SERVICE_NAME
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

  async getManyRefunds(
    data: PaymentProto.GetManyRefundsRequest
  ): Promise<PaymentProto.GetManyRefundsResponseWithVehicleName> {
    const refunds = await lastValueFrom(this.chatService.getManyRefunds(data));

    const bookingIds = refunds.refunds
      .map((refund) => refund.bookingId)
      .filter((id): id is string => id !== undefined);

    const vehicleNames = await lastValueFrom(
      this.bookingService.getVehicleNamesByBookingIds({
        bookingIds,
      })
    );

    const result = refunds.refunds.map((item, index) => ({
      ...item,
      vehicleName: vehicleNames.vehicleNames[index],
    }));

    return {
      refunds: result,
      page: refunds.page,
      limit: refunds.limit,
      totalItems: refunds.totalItems,
      totalPages: refunds.totalPages,
    };
  }

  async getRefund(
    data: PaymentProto.GetRefundRequest
  ): Promise<PaymentProto.GetRefundResponseWithVehicleName> {
    const refund = await lastValueFrom(this.chatService.getRefund(data));

    const bookingId = [refund.bookingId].filter(
      (id): id is string => id !== undefined
    );

    const vehicleNames = await lastValueFrom(
      this.bookingService.getVehicleNamesByBookingIds({
        bookingIds: bookingId,
      })
    );

    return {
      ...refund,
      vehicleName: vehicleNames.vehicleNames[0],
    };
  }
}
