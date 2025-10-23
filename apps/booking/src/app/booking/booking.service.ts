import {
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetManyBookingsRequest,
} from '@domain/booking';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable, Logger } from '@nestjs/common';
import { BookingNotFoundException } from './booking.error';
import { BookingRepository } from './booking.repo';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly natsClient: NatsClient
  ) {}

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
    // const booking = await this.bookingRepository.createBooking(data);

    const booking = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user_123456789',
      vehicleId: 'vehicle_abc123def',
      status: 'CONFIRMED' as const,

      // Thời gian thuê
      startTime: new Date('2025-10-25T08:00:00Z'),
      endTime: new Date('2025-10-27T18:00:00Z'),
      duration: 58, // 58 giờ

      // Địa chỉ lấy xe
      pickupAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      pickupLat: 10.77345678,
      pickupLng: 106.70123456,

      // Chi phí
      rentalFee: 1500000, // 1.5 triệu
      insuranceFee: 150000, // 150k
      vat: 165000, // 10% của (rental + insurance)
      discount: 100000, // Giảm 100k
      deposit: 500000, // Cọc 500k
      totalAmount: 2215000, // Tổng = 1500000 + 150000 + 165000 - 100000 + 500000
      refundAmount: 0,
      penaltyAmount: 0,

      // Payment
      paymentStatus: 'PAID' as const,
      paymentId: 'pay_987654321xyz',
      paidAt: new Date('2025-10-23T14:30:00Z'),

      // Ghi chú
      notes: 'Cần xe để đi du lịch Đà Lạt cuối tuần',
      cancelReason: null,
      adminNotes: null,
      damageReported: false,

      // Timestamps
      createdAt: new Date('2025-10-23T10:15:00Z'),
      updatedAt: new Date('2025-10-23T14:30:00Z'),
      cancelledAt: null,
      expiredAt: null,
    };

    try {
      const eventData = {
        id: booking.id,
        userId: booking.userId,
        type: 'VEHICLE',
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
      };

      await this.natsClient.publish(
        'journey.events.booking-created',
        eventData
      );

      this.logger.log(
        `✅ Published booking-created event for user: ${booking.userId}`
      );
    } catch (error) {
      this.logger.error(`❌ Failed to publish booking-created event:`, error);
    }

    return booking;
  }

  cancelBooking(data: CancelBookingRequest) {
    return this.bookingRepository.cancelBooking(data);
  }
}
