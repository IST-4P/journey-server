import {
  BookingStatus,
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
import {
  calculateDuration,
  calculateRefundPercentage,
  calculateVehiclePrice,
} from '@hacmieu-journey/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingCannotCancelLessThan5DaysException,
  BookingCannotCancelWithCheckInsException,
  BookingNotFoundException,
} from './booking.error';

@Injectable()
export class BookingRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient,
    private readonly configService: ConfigService
  ) {}

  async getManyBookings({ page, limit, ...where }: GetManyBookingsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [totalItems, bookings] = await Promise.all([
      this.prismaService.booking.count({
        where,
      }),
      this.prismaService.booking.findMany({
        where,
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
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getBooking(data: GetBookingRequest) {
    return this.prismaService.booking
      .findUnique({
        where: {
          id: data.id,
          userId: data.userId,
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
    return this.prismaService.$transaction(async (tx) => {
      const durationHours = calculateDuration(data.startTime, data.endTime);

      const vatPercent =
        this.configService.getOrThrow<number>('BOOKING_VAT') || 0;

      const deposit =
        this.configService.getOrThrow<number>('BOOKING_DEPOSIT') || 0;

      const collateral =
        this.configService.getOrThrow<number>('BOOKING_COLLATERAL') || 0;

      const insuranceFeePercent =
        this.configService.getOrThrow<number>('BOOKING_INSURANCE_FEE') || 0;

      const allPrices = calculateVehiclePrice({
        vehicleFeeDay: data.vehicleFeeDay,
        vehicleFeeHour: data.vehicleFeeHour,
        insuranceFeePercent,
        vatPercent,
        deposit,
        hours: durationHours,
      });

      const createBooking = await tx.booking.create({
        data: {
          ...data,
          rentalFee: allPrices.rentalFee,
          insuranceFee: allPrices.insuranceFee,
          vat: allPrices.vat,
          deposit: Number(deposit),
          collateral: Number(collateral),
          duration: durationHours,
          totalAmount: allPrices.totalAmount,
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
        'journey.events.payment-created',
        {
          id: createBooking.id,
          userId: createBooking.userId,
          type: 'VEHICLE',
          bookingId: createBooking.id,
          totalAmount: createBooking.collateral,
        }
      );

      const reservedVehicle$ = this.natsClient.publish(
        'journey.events.vehicle-reserved',
        {
          id: data.vehicleId,
        }
      );

      await Promise.all([
        createBookingHistory$,
        createPayment$,
        reservedVehicle$,
      ]);

      return {
        ...createBooking,
        pickupLat: createBooking.pickupLat.toNumber(),
        pickupLng: createBooking.pickupLng.toNumber(),
      };
    });
  }

  async cancelBooking(data: CancelBookingRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: {
          id: data.id,
        },
        include: {
          checkIns: {
            where: {
              type: 'CHECK_IN',
            },
          },
        },
      });
      if (!booking) {
        throw BookingNotFoundException;
      }
      if (booking.checkIns.length > 0) {
        throw BookingCannotCancelWithCheckInsException;
      }

      const refundPercentage = calculateRefundPercentage(
        new Date(),
        booking.startTime
      );
      if (refundPercentage === 0) {
        throw BookingCannotCancelLessThan5DaysException;
      }
      const refundAmount = (booking.collateral * refundPercentage) / 100;

      const updateStatusBooking$ = tx.booking.update({
        where: {
          id: data.id,
        },
        data: {
          status: BookingStatusValues.CANCELLED,
          cancelReason: data.cancelReason,
          refundAmount,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.id,
          action: HistoryActionValues.CANCELLED,
          notes: `Booking cancelled. Refund percentage: ${refundPercentage}%. Refund amount: ${refundAmount}`,
        },
      });

      const createRefund$ = this.natsClient.publish(
        'journey.events.refund-created',
        {
          id: data.id,
          userId: booking.userId,
          bookingId: booking.id,
          penaltyAmount: 0,
          damageAmount: 0,
          overtimeAmount: 0,
          collateral: refundAmount,
          deposit: 0,
        }
      );

      const [cancelBooking] = await Promise.all([
        updateStatusBooking$,
        createBookingHistory$,
        createRefund$,
      ]);

      return {
        ...cancelBooking,
        pickupLat: cancelBooking.pickupLat.toNumber(),
        pickupLng: cancelBooking.pickupLng.toNumber(),
      };
    });
  }

  async updateStatusBooking(data: UpdateStatusBookingRequest) {
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!booking) {
      throw BookingNotFoundException;
    }
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

  async bookingDepositPaid(data: { id: string }) {
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
          status: BookingStatusValues.DEPOSIT_PAID,
          paymentStatus: PaymentStatusValues.PAID,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.id,
          action: HistoryActionValues.DEPOSIT_PAID,
          notes: 'Booking deposit paid successfully',
        },
      });

      await Promise.all([updateStatusBooking$, createBookingHistory$]);
    });
  }

  async bookingExpired(data: { id: string }) {
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
          status: BookingStatusValues.EXPIRED,
          paymentStatus: PaymentStatusValues.FAILED,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.id,
          action: HistoryActionValues.CANCELLED,
          notes: 'Booking expired',
        },
      });

      const vehicleActive$ = this.natsClient.publish(
        'journey.events.vehicle-active',
        {
          id: booking.vehicleId,
        }
      );

      await Promise.all([
        updateStatusBooking$,
        createBookingHistory$,
        vehicleActive$,
      ]);
    });
  }

  async getInformationBooking() {
    const statusGroups = await this.prismaService.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusCounts = statusGroups.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<BookingStatus, number>);

    return {
      all: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      pending: statusCounts['PENDING'] || 0,
      ongoing: statusCounts['ONGOING'] || 0,
      completed: statusCounts['COMPLETED'] || 0,
      cancelled: statusCounts['CANCELLED'] || 0,
    };
  }
}
