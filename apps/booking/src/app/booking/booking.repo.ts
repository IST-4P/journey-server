import {
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetManyBookingsRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private calculateDuration(startTime: Date, endTime: Date): number {
    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours;
  }

  async getManyBookings(data: GetManyBookingsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const [totalItems, bookings] = await Promise.all([
      this.prismaService.booking.count({
        where: data,
      }),
      this.prismaService.booking.findMany({
        where: data,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      bookings: bookings.map((booking) => ({
        ...booking,
        pickupLat: booking.pickupLat.toNumber(),
        pickupLng: booking.pickupLng.toNumber(),
      })),
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async getBooking(data: GetBookingRequest) {
    return this.prismaService.booking
      .findUnique({
        where: {
          id: data.id,
        },
      })
      .then((booking) => {
        if (!booking) return null;

        return {
          ...booking,
          pickupLat: booking.pickupLat.toNumber(),
          pickupLng: booking.pickupLng.toNumber(),
        };
      });
  }

  async createBooking(data: CreateBookingRequest) {
    const totalAmount =
      data.rentalFee +
      data.insuranceFee +
      data.vat -
      data.discount +
      data.deposit;

    return this.prismaService.booking
      .create({
        data: {
          ...data,
          duration: this.calculateDuration(data.startTime, data.endTime),
          totalAmount,
        },
      })
      .then((booking) => {
        return {
          ...booking,
          pickupLat: booking.pickupLat.toNumber(),
          pickupLng: booking.pickupLng.toNumber(),
        };
      });
  }

  async cancelBooking(data: CancelBookingRequest) {
    return this.prismaService.booking
      .update({
        where: {
          id: data.id,
        },
        data: {
          status: 'CANCELLED',
          cancelReason: data.cancelReason,
        },
      })
      .then((booking) => {
        return {
          ...booking,
          pickupLat: booking.pickupLat.toNumber(),
          pickupLng: booking.pickupLng.toNumber(),
        };
      });
  }
}
