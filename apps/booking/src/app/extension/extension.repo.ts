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

  async getManyExtensions(data: GetManyExtensionsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const [totalItems, extensions] = await Promise.all([
      this.prismaService.bookingExtension.count({
        where: data,
      }),
      this.prismaService.bookingExtension.findMany({
        where: data,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      extensions,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  async getExtension(data: GetExtensionRequest) {
    return this.prismaService.bookingExtension.findUnique({
      where: {
        id: data.id,
      },
    });
  }

  async createExtension(data: CreateExtensionRequest) {
    return this.prismaService.$transaction(async (tx) => {
      const diffMs = data.newEndTime.getTime() - data.originalEndTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const booking = await tx.booking.findUnique({
        where: { id: data.bookingId },
      });
      if (!booking) {
        throw BookingNotFoundException;
      }
      const createExtension$ = tx.bookingExtension.create({
        data: {
          ...data,
          additionalHours: Math.ceil(diffHours),
          additionalAmount: booking
            ? Math.ceil(booking.vehicleFeeHour * diffHours)
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
    return this.prismaService.$transaction(async (tx) => {
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
        'journey.events.payment-created',
        {
          id: extension.id,
          userId: extension.requestedBy,
          type: 'VEHICLE',
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
