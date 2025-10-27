import {
  BookingStatusValues,
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetManyCheckInOutsRequest,
  HistoryActionValues,
  VerifyCheckInOutRequest,
} from '@domain/booking';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { BookingNotFoundException } from '../booking/booking.error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckInOutRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  async getManyCheckInOuts(data: GetManyCheckInOutsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const [totalItems, checkInOuts] = await Promise.all([
      this.prismaService.checkInOut.count({
        where: data,
      }),
      this.prismaService.checkInOut.findMany({
        where: data,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      checkInOuts: checkInOuts.map((checkInOut) => ({
        ...checkInOut,
        latitude: checkInOut.latitude.toNumber(),
        longitude: checkInOut.longitude.toNumber(),
      })),
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async getCheckInOut(data: GetCheckInOutRequest) {
    return this.prismaService.checkInOut
      .findUnique({
        where: {
          id: data.id,
        },
      })
      .then((checkInOut) => {
        if (!checkInOut) return null;

        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
  }

  async checkIn(data: CreateCheckInOutRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: {
          id: data.bookingId,
        },
      });

      if (!booking) {
        throw BookingNotFoundException;
      }

      if (data.checkDate < booking.startTime) {
        throw new Error('Error.CheckInWrongTime');
      }

      const createCheckIn$ = tx.checkInOut.create({
        data,
      });

      const updateStatusBooking$ = tx.booking.update({
        where: { id: data.bookingId },
        data: { status: BookingStatusValues.ONGOING },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.bookingId,
          action: HistoryActionValues.CHECKED_IN,
          notes: 'Booking checked in successfully',
        },
      });

      const updateStatusVehicle$ = this.natsClient.publish(
        'journey.events.vehicle-rented',
        {
          id: booking.vehicleId,
        }
      );

      const [checkIn] = await Promise.all([
        createCheckIn$,
        updateStatusBooking$,
        createBookingHistory$,
        updateStatusVehicle$,
      ]);

      return {
        ...checkIn,
        latitude: checkIn.latitude.toNumber(),
        longitude: checkIn.longitude.toNumber(),
      };
    });
  }

  async verifyCheckInOut(data: VerifyCheckInOutRequest) {
    return this.prismaService.checkInOut
      .update({
        where: { id: data.id },
        data: {
          verified: data.verified,
          verifiedAt: data.verifiedAt,
        },
      })
      .then((checkInOut) => {
        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
  }
}
