import { BookingProto, VehicleProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);
  private bookingService!: BookingProto.BookingServiceClient;
  private vehicleService!: VehicleProto.VehicleServiceClient;

  constructor(
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private bookingClient: ClientGrpc,
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private vehicleClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.bookingService =
      this.bookingClient.getService<BookingProto.BookingServiceClient>(
        BookingProto.BOOKING_SERVICE_NAME
      );
    this.vehicleService =
      this.vehicleClient.getService<VehicleProto.VehicleServiceClient>(
        VehicleProto.VEHICLE_SERVICE_NAME
      );
  }

  //================= Bookings =================//

  getManyBookings(
    data: BookingProto.GetManyBookingsRequest
  ): Promise<BookingProto.GetManyBookingsResponse> {
    return lastValueFrom(this.bookingService.getManyBookings(data));
  }

  getBooking(
    data: BookingProto.GetBookingRequest
  ): Promise<BookingProto.GetBookingResponse> {
    return lastValueFrom(this.bookingService.getBooking(data));
  }

  async createBooking(
    data: BookingProto.CreateBookingRequest
  ): Promise<BookingProto.GetBookingResponse> {
    const vehicle = await lastValueFrom(
      this.vehicleService.getVehicle({ id: data.vehicleId })
    );
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    if (vehicle.status !== 'ACTIVE') {
      throw new Error('Vehicle is not ACTIVE for booking');
    }
    data.vehicleFeeHour = vehicle.pricePerHour;
    return lastValueFrom(this.bookingService.createBooking(data));
  }

  cancelBooking(
    data: BookingProto.CancelBookingRequest
  ): Promise<BookingProto.GetBookingResponse> {
    return lastValueFrom(this.bookingService.cancelBooking(data));
  }

  //================= CheckInOuts =================//

  getManyCheckInOuts(
    data: BookingProto.GetManyCheckInOutsRequest
  ): Promise<BookingProto.GetManyCheckInOutsResponse> {
    return lastValueFrom(this.bookingService.getManyCheckInOuts(data));
  }

  getCheckInOut(
    data: BookingProto.GetCheckInOutRequest
  ): Promise<BookingProto.GetCheckInOutResponse> {
    return lastValueFrom(this.bookingService.getCheckInOut(data));
  }

  checkIn(
    data: BookingProto.CreateCheckInOutRequest
  ): Promise<BookingProto.GetCheckInOutResponse> {
    return lastValueFrom(this.bookingService.checkIn(data));
  }

  checkOut(
    data: BookingProto.CreateCheckInOutRequest
  ): Promise<BookingProto.GetCheckInOutResponse> {
    return lastValueFrom(this.bookingService.checkOut(data));
  }

  //================= Extensions =================//

  getManyExtensions(
    data: BookingProto.GetManyExtensionsRequest
  ): Promise<BookingProto.GetManyExtensionsResponse> {
    return lastValueFrom(this.bookingService.getManyExtensions(data));
  }

  getExtension(
    data: BookingProto.GetExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.getExtension(data));
  }

  createExtension(
    data: BookingProto.CreateExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.createExtension(data));
  }
}
