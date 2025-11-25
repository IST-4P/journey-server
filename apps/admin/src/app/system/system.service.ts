import { BookingStatusValues } from '@domain/booking';
import { ComboStatusValues, DeviceStatusValues } from '@domain/device';
import { RefundStatusValues } from '@domain/payment';
import { RentalStatusValues } from '@domain/rental';
import { VehicleStatusValues } from '@domain/vehicle';
import {
  BlogProto,
  BookingProto,
  DeviceProto,
  PaymentProto,
  RentalProto,
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
  private deviceService!: DeviceProto.DeviceServiceClient;
  private rentalService!: RentalProto.RentalServiceClient;
  private blogService!: BlogProto.BlogServiceClient;

  constructor(
    @Inject(UserProto.USER_PACKAGE_NAME) private userClient: ClientGrpc,
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private bookingClient: ClientGrpc,
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private vehicleClient: ClientGrpc,
    @Inject(PaymentProto.PAYMENT_PACKAGE_NAME)
    private paymentClient: ClientGrpc,
    @Inject(DeviceProto.DEVICE_PACKAGE_NAME) private deviceClient: ClientGrpc,
    @Inject(RentalProto.RENTAL_PACKAGE_NAME) private rentalClient: ClientGrpc,
    @Inject(BlogProto.BLOG_PACKAGE_NAME) private blogClient: ClientGrpc
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
    this.deviceService =
      this.deviceClient.getService<DeviceProto.DeviceServiceClient>(
        DeviceProto.DEVICE_SERVICE_NAME
      );
    this.rentalService =
      this.rentalClient.getService<RentalProto.RentalServiceClient>(
        RentalProto.RENTAL_SERVICE_NAME
      );
    this.blogService = this.blogClient.getService<BlogProto.BlogServiceClient>(
      BlogProto.BLOG_SERVICE_NAME
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
    const deviceCount$ = lastValueFrom(
      this.deviceService.dashboardDevice({
        status: DeviceStatusValues.AVAILABLE,
      })
    );
    const comboCount$ = lastValueFrom(
      this.deviceService.dashboardCombo({
        status: ComboStatusValues.ACTIVE,
      })
    );
    const rentalCount$ = lastValueFrom(
      this.rentalService.dashboardRental({ status: RentalStatusValues.ACTIVE })
    );
    const blogCount$ = lastValueFrom(
      this.blogService.dashboardBlog({ status: '' })
    );

    const [
      userCount,
      bookingCount,
      vehicleCount,
      refundCount,
      deviceCount,
      comboCount,
      rentalCount,
      blogCount,
    ] = await Promise.all([
      userCount$,
      bookingCount$,
      vehicleCount$,
      refundCount$,
      deviceCount$,
      comboCount$,
      rentalCount$,
      blogCount$,
    ]);
    return {
      userCount: userCount.userCount,
      bookingOngoing: bookingCount.bookingCount,
      extensionPending: bookingCount.extensionPending,
      checkOutPending: bookingCount.checkOutPending,
      vehicleActive: vehicleCount.vehicleCount,
      refundPending: refundCount.refundCount,
      deviceAvailable: deviceCount.total,
      comboActive: comboCount.total,
      rentalActive: rentalCount.rentalCount,
      blogCount: blogCount.totalBlog,
    };
  }
}
