import {
  BookingStatusValues,
  CheckTypeEnumValues,
  CreateCheckInOutRequest,
  GetCheckInOutRequest,
  GetManyCheckInOutsRequest,
  HistoryActionValues,
  UpdateCheckOutRequest,
  VerifyCheckInOutRequest,
} from '@domain/booking';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { BookingNotFoundException } from '../booking/booking.error';
import { PrismaService } from '../prisma/prisma.service';
import {
  CheckInNotPaidException,
  CheckInOutAlreadyExistsException,
  CheckInWrongTimeException,
  CheckOutWithoutCheckInException,
} from './check-in-out.error';

@Injectable()
export class CheckInOutRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  async getManyCheckInOuts(data: GetManyCheckInOutsRequest) {
    const [checkIn, checkOut] = await Promise.all([
      this.prismaService.checkInOut.findFirst({
        where: {
          ...data,
          type: CheckTypeEnumValues.CHECK_IN,
        },
      }),
      this.prismaService.checkInOut.findFirst({
        where: {
          ...data,
          type: CheckTypeEnumValues.CHECK_OUT,
        },
      }),
    ]);

    return {
      checkIn: checkIn
        ? {
            ...checkIn,
            latitude: checkIn.latitude.toNumber(),
            longitude: checkIn.longitude.toNumber(),
          }
        : undefined,
      checkOut: checkOut
        ? {
            ...checkOut,
            latitude: checkOut.latitude.toNumber(),
            longitude: checkOut.longitude.toNumber(),
          }
        : undefined,
      message:
        !checkIn && !checkOut
          ? 'Error.CheckInOutNotFound'
          : !checkIn
          ? 'Message.CheckInNotFound'
          : !checkOut
          ? 'Message.CheckOutNotFound'
          : 'Success',
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
        include: {
          checkIns: {
            where: {
              type: CheckTypeEnumValues.CHECK_IN,
            },
          },
        },
      });

      if (!booking) {
        throw BookingNotFoundException;
      }

      if (booking.status !== BookingStatusValues.FULLY_PAID) {
        throw CheckInNotPaidException;
      }

      if (booking.checkIns.length > 0) {
        throw CheckInOutAlreadyExistsException;
      }

      const checkDate = new Date(data.checkDate!);
      console.log('checkDate: ', checkDate);
      console.log('booking.startTime: ', booking.startTime);

      // Allow check-in up to 1 hour before booking start time
      const oneHourBeforeStart = new Date(
        booking.startTime.getTime() - 60 * 60 * 1000
      );
      if (checkDate < oneHourBeforeStart) {
        throw CheckInWrongTimeException;
      }

      const { checkDate: _, ...body } = data;

      const createCheckIn$ = tx.checkInOut.create({
        data: {
          ...body,
          verified: true,
          verifiedAt: new Date(),
        },
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

  async checkOut(data: CreateCheckInOutRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: {
          id: data.bookingId,
        },
        include: {
          checkIns: true,
        },
      });

      if (!booking) {
        throw BookingNotFoundException;
      }

      const hasCheckIn = booking.checkIns.some(
        (checkIn) => checkIn.type === CheckTypeEnumValues.CHECK_IN
      );
      const hasCheckOut = booking.checkIns.some(
        (checkIn) => checkIn.type === CheckTypeEnumValues.CHECK_OUT
      );

      if (!hasCheckIn) {
        throw CheckOutWithoutCheckInException;
      }

      if (hasCheckOut) {
        throw CheckInOutAlreadyExistsException;
      }

      let overtimeAmount = 0;

      // Nếu trả xe qua giờ, tính phí phạt (cho phép trả muộn 1 tiếng)
      const checkDate = new Date(data.checkDate!);
      const oneHourAfterEnd = new Date(
        booking.endTime.getTime() + 60 * 60 * 1000
      );
      if (checkDate > oneHourAfterEnd) {
        const diffInHours =
          (checkDate.getTime() - oneHourAfterEnd.getTime()) / (1000 * 60 * 60);
        const formattedHours = Number(diffInHours.toFixed(1));
        overtimeAmount = formattedHours * booking.vehicleFeeHour * 1.5;
      }
      const { checkDate: _, ...body } = data;
      const createCheckOut$ = tx.checkInOut.create({
        data: {
          ...body,
          verified: false,
        },
      });

      const updatePenaltyAmount$ = tx.booking.update({
        where: { id: data.bookingId },
        data: {
          overtimeAmount: {
            increment: overtimeAmount,
          },
          status: BookingStatusValues.PENDING_REFUND,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.bookingId,
          action: HistoryActionValues.CHECKED_OUT,
          notes: 'Booking checked out successfully',
        },
      });

      const [checkOut] = await Promise.all([
        createCheckOut$,
        updatePenaltyAmount$,
        createBookingHistory$,
      ]);

      return {
        ...checkOut,
        latitude: checkOut.latitude.toNumber(),
        longitude: checkOut.longitude.toNumber(),
      };
    });
  }

  async updateCheckOut(data: UpdateCheckOutRequest) {
    const booking = await this.prismaService.checkInOut.findUnique({
      where: { id: data.id },
      include: {
        booking: {
          select: { id: true },
        },
      },
    });
    await this.prismaService.booking.update({
      where: { id: booking?.booking.id },
      data: {
        penaltyAmount: {
          increment: data.penaltyAmount,
        },
        damageAmount: {
          increment: data.damageAmount,
        },
        overtimeAmount: {
          increment: data.overtimeAmount,
        },
      },
    });
    return this.prismaService.checkInOut
      .update({
        where: { id: data.id },
        data: {
          mileage: data.mileage,
          fuelLevel: data.fuelLevel,
          damageNotes: data.damageNotes,
          damageImages: data.damageImages,
        },
      })
      .then((checkOut) => {
        return {
          ...checkOut,
          latitude: checkOut.latitude.toNumber(),
          longitude: checkOut.longitude.toNumber(),
        };
      });
  }

  async verifyCheckInOut(data: VerifyCheckInOutRequest) {
    const verified = await this.prismaService.checkInOut
      .update({
        where: { id: data.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
        include: {
          booking: {
            select: {
              id: true,
              penaltyAmount: true,
              damageAmount: true,
              overtimeAmount: true,
              collateral: true,
              deposit: true,
              userId: true,
            },
          },
        },
      })
      .then((checkInOut) => {
        return {
          ...checkInOut,
          latitude: checkInOut.latitude.toNumber(),
          longitude: checkInOut.longitude.toNumber(),
        };
      });
    const updateBooking = await this.prismaService.booking.update({
      where: { id: verified.booking.id },
      data: { status: BookingStatusValues.COMPLETED },
    });
    const createdRefund$ = this.natsClient.publish(
      'journey.events.refund-created',
      {
        bookingId: verified.booking.id,
        userId: verified.booking.userId,
        penaltyAmount: verified.booking.penaltyAmount,
        damageAmount: verified.booking.damageAmount,
        overtimeAmount: verified.booking.overtimeAmount,
        collateral: 0,
        deposit: verified.booking.deposit,
      }
    );

    const vehicleMaintenance$ = this.natsClient.publish(
      'journey.events.vehicle-maintenance',
      {
        id: updateBooking.vehicleId,
      }
    );
    await Promise.all([createdRefund$, vehicleMaintenance$]);
    return verified;
  }
}
