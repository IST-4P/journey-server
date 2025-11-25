import { BookingStatusValues } from '@domain/booking';
import { RefundStatusValues } from '@domain/payment';
import { VehicleStatusValues } from '@domain/vehicle';
import {
  BookingProto,
  PaymentProto,
  UserProto,
  VehicleProto,
} from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SystemService implements OnModuleInit {
  private userService!: UserProto.UserServiceClient;
  private bookingService!: BookingProto.BookingServiceClient;
  private vehicleService!: VehicleProto.VehicleServiceClient;
  private paymentService!: PaymentProto.PaymentServiceClient;

  constructor(
    @Inject(UserProto.USER_PACKAGE_NAME) private userClient: ClientGrpc,
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private bookingClient: ClientGrpc,
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private vehicleClient: ClientGrpc,
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME) private paymentClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserProto.UserServiceClient>(
      UserProto.USER_SERVICE_NAME
    );
    this.bookingService =
      this.bookingClient.getService<BookingProto.BookingServiceClient>(
        BookingProto.BOOKING_SERVICE_NAME
      );
    this.vehicleService =
      this.vehicleClient.getService<VehicleProto.VehicleServiceClient>(
        VehicleProto.VEHICLE_SERVICE_NAME
      );
    this.paymentService =
      this.paymentClient.getService<PaymentProto.PaymentServiceClient>(
        PaymentProto.PAYMENT_SERVICE_NAME
      );
  }

  async dashboard() {
    const userCount$ = lastValueFrom(this.userService.userCount({}));
    const bookingCount$ = lastValueFrom(
      this.bookingService.bookingCount({
        status: BookingStatusValues.COMPLETED,
      })
    );
    const vehicleCount$ = lastValueFrom(
      this.vehicleService.vehicleCount({ status: VehicleStatusValues.ACTIVE })
    );
    const refundCount$ = lastValueFrom(
      this.paymentService.refundCount({ status: RefundStatusValues.PENDING })
    );

    const [userCount, bookingCount, vehicleCount, refundCount] =
      await Promise.all([
        userCount$,
        bookingCount$,
        vehicleCount$,
        refundCount$,
      ]);
    return {
      userCount: userCount.userCount,
      bookingOngoing: bookingCount.bookingCount,
      extensionPending: bookingCount.extensionPending,
      checkOutPending: bookingCount.checkOutPending,
      vehicleActive: vehicleCount.vehicleCount,
      refundPending: refundCount.refundCount,
    };
  }
}
