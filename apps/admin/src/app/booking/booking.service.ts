import { BookingProto } from '@hacmieu-journey/grpc';
import { NatsClient } from '@hacmieu-journey/nats';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);
  private bookingService!: BookingProto.BookingServiceClient;

  constructor(
    @Inject(BookingProto.BOOKING_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly natsClient: NatsClient
  ) {}

  onModuleInit() {
    this.bookingService =
      this.client.getService<BookingProto.BookingServiceClient>(
        BookingProto.BOOKING_SERVICE_NAME
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

  updateCheckOut(
    data: BookingProto.UpdateCheckOutRequest
  ): Promise<BookingProto.GetCheckInOutResponse> {
    return lastValueFrom(this.bookingService.updateCheckOut(data));
  }

  verifyCheckInOut(
    data: BookingProto.VerifyCheckInOutRequest
  ): Promise<BookingProto.GetCheckInOutResponse> {
    return lastValueFrom(this.bookingService.verifyCheckInOut(data));
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

  updateExtension(
    data: BookingProto.UpdateExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.updateExtension(data));
  }

  approveExtension(
    data: BookingProto.UpdateStatusExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.approveExtension(data));
  }

  rejectExtension(
    data: BookingProto.UpdateStatusExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.rejectExtension(data));
  }

  UpdateExtension(
    data: BookingProto.UpdateExtensionRequest
  ): Promise<BookingProto.GetExtensionResponse> {
    return lastValueFrom(this.bookingService.updateExtension(data));
  }

  //================= Histories =================//

  getManyHistories(
    data: BookingProto.GetManyHistoriesRequest
  ): Promise<BookingProto.GetManyHistoriesResponse> {
    return lastValueFrom(this.bookingService.getManyHistories(data));
  }

  getHistory(
    data: BookingProto.GetHistoryRequest
  ): Promise<BookingProto.GetHistoryResponse> {
    return lastValueFrom(this.bookingService.getHistory(data));
  }
}
