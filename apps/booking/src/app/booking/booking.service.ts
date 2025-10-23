import {
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetManyBookingsRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { BookingNotFoundException } from './booking.error';
import { BookingRepository } from './booking.repo';

@Injectable()
export class BookingService {
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

  createBooking(data: CreateBookingRequest) {
    return this.bookingRepository.createBooking(data);
  }

  cancelBooking(data: CancelBookingRequest) {
    return this.bookingRepository.cancelBooking(data);
  }
}
