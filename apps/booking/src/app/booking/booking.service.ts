import {
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetManyBookingsRequest,
  GetVehicleNamesByBookingIdsRequest,
  UpdateStatusBookingRequest,
} from '@domain/booking';
import { Injectable, Logger } from '@nestjs/common';
import { BookingNotFoundException } from './booking.error';
import { BookingRepository } from './booking.repo';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(private readonly bookingRepository: BookingRepository) {}

  async getManyBookings(data: GetManyBookingsRequest) {
    const bookings = await this.bookingRepository.getManyBookings(data);
    if (bookings.bookings.length === 0) {
      throw BookingNotFoundException;
    }
    return bookings;
  }

  async getBooking(data: GetBookingRequest) {
    const booking = await this.bookingRepository.getBooking(data);
    if (!booking) {
      throw BookingNotFoundException;
    }
    return booking;
  }

  async createBooking(data: CreateBookingRequest) {
    return this.bookingRepository.createBooking(data);
  }

  async cancelBooking(data: CancelBookingRequest) {
    return this.bookingRepository.cancelBooking(data);
  }

  async updateStatusBooking(data: UpdateStatusBookingRequest) {
    return this.bookingRepository.updateStatusBooking(data);
  }

  async getInformationBooking() {
    return this.bookingRepository.getInformationBooking();
  }

  async getVehicleNamesByBookingIds(data: GetVehicleNamesByBookingIdsRequest) {
    return this.bookingRepository.getVehicleNamesByBookingIds(data);
  }
}
