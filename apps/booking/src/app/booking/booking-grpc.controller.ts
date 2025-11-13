import {
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetBookingResponse,
  GetInformationBookingResponse,
  GetManyBookingsRequest,
  GetManyBookingsResponse,
  UpdateStatusBookingRequest,
} from '@domain/booking';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BookingService } from './booking.service';

@Controller()
export class BookingGrpcController {
  constructor(private readonly bookingService: BookingService) {}

  @GrpcMethod('BookingService', 'GetManyBookings')
  getManyBookings(
    data: GetManyBookingsRequest
  ): Promise<GetManyBookingsResponse> {
    return this.bookingService.getManyBookings(data);
  }

  @GrpcMethod('BookingService', 'GetBooking')
  getBooking(data: GetBookingRequest): Promise<GetBookingResponse> {
    return this.bookingService.getBooking(data);
  }

  @GrpcMethod('BookingService', 'CreateBooking')
  createBooking(data: CreateBookingRequest): Promise<GetBookingResponse> {
    return this.bookingService.createBooking(data);
  }

  @GrpcMethod('BookingService', 'CancelBooking')
  cancelBooking(data: CancelBookingRequest): Promise<GetBookingResponse> {
    return this.bookingService.cancelBooking(data);
  }

  @GrpcMethod('BookingService', 'UpdateStatusBooking')
  updateStatusBooking(
    data: UpdateStatusBookingRequest
  ): Promise<GetBookingResponse> {
    return this.bookingService.updateStatusBooking(data);
  }

  @GrpcMethod('BookingService', 'GetInformationBooking')
  getInformationBooking(): Promise<GetInformationBookingResponse> {
    return this.bookingService.getInformationBooking();
  }
}
