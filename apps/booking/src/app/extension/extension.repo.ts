import {
  CreateExtensionRequest,
  ExtensionStatusEnumValues,
  GetExtensionRequest,
  GetManyExtensionsRequest,
  HistoryActionValues,
  UpdateExtensionRequest,
  UpdateStatusExtensionRequest,
} from '@domain/booking';
import { NatsClient } from '@hacmieu-journey/nats';
import {
  calculateDuration,
  convertHoursToDaysAndHours,
} from '@hacmieu-journey/nestjs';
import { Injectable } from '@nestjs/common';
import { BookingNotFoundException } from '../booking/booking.error';
import { PrismaService } from '../prisma/prisma.service';
import { ExtensionNotFoundException } from './extension.error';

@Injectable()
export class ExtensionRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  async getManyExtensions({ page, limit, ...where }: GetManyExtensionsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [totalItems, extensions] = await Promise.all([
      this.prismaService.bookingExtension.count({
        where,
      }),
      this.prismaService.bookingExtension.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      extensions,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getExtension(data: GetExtensionRequest) {
    return this.prismaService.bookingExtension.findUnique({
      where: data,
    });
  }

  async createExtension(data: CreateExtensionRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const diffMs = calculateDuration(data.originalEndTime, data.newEndTime);
      const diffHours = convertHoursToDaysAndHours(diffMs);
      const booking = await tx.booking.findUnique({
        where: { id: data.bookingId },
      });
      if (!booking) {
        throw BookingNotFoundException;
      }
      const createExtension$ = tx.bookingExtension.create({
        data: {
          ...data,
          originalEndTime: new Date(data.originalEndTime).toISOString(),
          newEndTime: new Date(data.newEndTime).toISOString(),
          additionalHours: diffHours.days * 24 + diffHours.hours,
          additionalAmount: booking
            ? Math.ceil(
                booking.vehicleFeeHour * (diffHours.days * 24 + diffHours.hours)
              )
            : 0,
        },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: data.bookingId,
          action: HistoryActionValues.EXTENSION_REQUESTED,
          notes: `Extension requested for booking ${data.bookingId}`,
        },
      });

      const [extension] = await Promise.all([
        createExtension$,
        createBookingHistory$,
      ]);
      return extension;
    });
  }

  async approveExtension(data: UpdateStatusExtensionRequest) {
    const result = await this.prismaService.$transaction(async (tx) => {
      const extension = await tx.bookingExtension.findUnique({
        where: { id: data.id },
      });
      if (!extension) {
        throw ExtensionNotFoundException;
      }
      const updateExtension$ = tx.bookingExtension.update({
        where: { id: data.id },
        data: { status: ExtensionStatusEnumValues.APPROVED },
      });

      const createBookingHistory$ = tx.bookingHistory.create({
        data: {
          bookingId: extension.bookingId,
          action: HistoryActionValues.EXTENSION_APPROVED,
          notes: `Extension approved for booking ${extension.bookingId}`,
        },
      });

      const createPayment$ = this.natsClient.publish(
        'journey.events.payment-extension',
        {
          id: extension.id,
          userId: extension.requestedBy,
          type: 'EXTENSION',
          bookingId: extension.bookingId,
          totalAmount: extension.additionalAmount,
        }
      );

      const [updatedExtension] = await Promise.all([
        updateExtension$,
        createBookingHistory$,
        createPayment$,
      ]);
      return updatedExtension;
    });
    await this.natsClient.publish('journey.events.notification-created', {
      userId: result.requestedBy,
      title: 'Extension Approved',
      content: `Your extension request for booking ${result.bookingId} has been approved.`,
      type: 'BOOKING' as const,
    });
    return result;
  }

  async rejectExtension(data: UpdateStatusExtensionRequest) {
    return this.prismaService.bookingExtension.update({
      where: { id: data.id },
      data: { status: ExtensionStatusEnumValues.REJECTED },
    });
  }

  async updateExtension(data: UpdateExtensionRequest) {
    return this.prismaService.bookingExtension.update({
      where: { id: data.id },
      data: {
        newEndTime: data.newEndTime,
        additionalHours: data.additionalHours,
        additionalAmount: data.additionalAmount,
        notes: data.notes,
      },
    });
  }
}
