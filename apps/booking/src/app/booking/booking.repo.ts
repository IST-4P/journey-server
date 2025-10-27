import {
  BookingStatusValues,
  CancelBookingRequest,
  CreateBookingRequest,
  GetBookingRequest,
  GetManyBookingsRequest,
  HistoryActionValues,
  PaymentStatusValues,
  UpdateStatusBookingRequest,
} from '@domain/booking';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingNotFoundException } from './booking.error';

@Injectable()
export class BookingRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  private calculateDuration(startTime: Date, endTime: Date): number {
    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }
    endTime = new Date(endTime);
    startTime = new Date(startTime);
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

    return this.prismaService.$transaction(async (tx) => {
      const createBooking = await tx.booking.create({
        data: {
          ...data,
          duration: this.calculateDuration(data.startTime, data.endTime),
          totalAmount,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: createBooking.id,
          action: HistoryActionValues.CREATED,
          notes: 'Booking created successfully',
        },
      });

      const createPayment$ = this.natsClient.publish(
        'journey.events.booking-created',
        {
          id: createBooking.id,
          userId: createBooking.userId,
          type: 'VEHICLE',
          bookingId: createBooking.id,
          totalAmount: createBooking.totalAmount,
        }
      );

      await Promise.all([createBookingHistory$, createPayment$]);

      return {
        ...createBooking,
        pickupLat: createBooking.pickupLat.toNumber(),
        pickupLng: createBooking.pickupLng.toNumber(),
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
          status: BookingStatusValues.CANCELLED,
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

  async updateStatusBooking(data: UpdateStatusBookingRequest) {
    return this.prismaService.booking
      .update({
        where: { id: data.id },
        data: { status: data.status },
      })
      .then((booking) => {
        return {
          ...booking,
          pickupLat: booking.pickupLat.toNumber(),
          pickupLng: booking.pickupLng.toNumber(),
        };
      });
  }

  async bookingPaid(data: { id: string }) {
    await this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: {
          id: data.id,
        },
      });

      if (!booking) {
        throw BookingNotFoundException;
      }

      const updateStatusBooking$ = tx.booking.update({
        where: { id: data.id },
        data: {
          status: BookingStatusValues.PAID,
          paymentStatus: PaymentStatusValues.PAID,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.id,
          action: HistoryActionValues.PAID,
          notes: 'Booking paid successfully',
        },
      });

      const updateStatusVehicle$ = this.natsClient.publish(
        'journey.events.vehicle-reserved',
        {
          id: booking.vehicleId,
        }
      );

      await Promise.all([
        updateStatusBooking$,
        createBookingHistory$,
        updateStatusVehicle$,
      ]);
    });
  }
}
