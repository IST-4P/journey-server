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
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingCannotCancelWithCheckInsException,
  BookingNotFoundException,
  BookingTimeInvalidException,
} from './booking.error';

@Injectable()
export class BookingRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient,
    private readonly configService: ConfigService
  ) {}

  private calculateDuration(startTime: Date, endTime: Date): number {
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    console.log('startTime: ', startTime);
    console.log('endTime: ', endTime);
    if (endTime <= startTime) {
      throw BookingTimeInvalidException;
    }
    endTime = new Date(endTime);
    startTime = new Date(startTime);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours;
  }

  private calculateRefundPercentage(cancelDate: Date, startDate: Date): number {
    // Chuyển đổi sang Date object nếu là string
    const cancel = new Date(cancelDate);
    const start = new Date(startDate);

    // Reset time về đầu ngày để so sánh chính xác số ngày
    cancel.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    // Tính số ngày chênh lệch
    const diffTime = start.getTime() - cancel.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Áp dụng chính sách hoàn tiền
    if (diffDays > 10) {
      return 100; // Hoàn 100% nếu hủy trước > 10 ngày
    } else if (diffDays > 5) {
      return 30; // Hoàn 30% nếu hủy trước > 5 ngày
    } else {
      return 0; // Không hoàn tiền nếu hủy trong vòng 5 ngày
    }
  }

  convertHoursToDaysAndHours(totalHours: number): {
    days: number;
    hours: number;
    totalHours: number;
  } {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    return {
      days,
      hours: remainingHours,
      totalHours,
    };
  }

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
      const durationHours = this.calculateDuration(
        data.startTime,
        data.endTime
      );
      const durationDayAndHours =
        this.convertHoursToDaysAndHours(durationHours);

      const rentalFee =
        durationDayAndHours.days * data.vehicleFeeDay +
        durationDayAndHours.hours * data.vehicleFeeHour;

      const insuranceFeePercent =
        this.configService.get<number>('BOOKING_INSURANCE_FEE') || 0;

      const insuranceFee = rentalFee * insuranceFeePercent;

      const deposit = this.configService.get<number>('BOOKING_DEPOSIT') || 0;

      const vatPercent = this.configService.get<number>('BOOKING_VAT') || 0;

      const totalAmount = Math.round(
        (rentalFee + insuranceFee + deposit) * (1 + vatPercent)
      ); // Tổng cộng bao gồm VAT 10%

      const collateral =
        this.configService.get<number>('BOOKING_COLLATERAL') || 0;

      const createBooking = await tx.booking.create({
        data: {
          ...data,
          rentalFee,
          insuranceFee,
          vat: Math.round((rentalFee + insuranceFee) * 0.1),
          deposit,
          duration: durationHours,
          totalAmount,
          collateral: Number(collateral),
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

      await Promise.all([createBookingHistory$, createPayment$]);

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
      const refundPercentage = this.calculateRefundPercentage(
        data.cancelDate,
        booking.startTime
      );
      const refundAmount = (booking.deposit * refundPercentage) / 100;

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
          collateral: 0,
          deposit: refundAmount,
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
