import {
  CreateExtensionRequest,
  GetExtensionRequest,
  GetManyExtensionsRequest,
  UpdateStatusExtensionRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExtensionRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
    return this.prismaService.bookingExtension.create({
      data,
    });
  }

  async updateStatusExtension(data: UpdateStatusExtensionRequest) {
    return this.prismaService.bookingExtension.update({
      where: { id: data.id },
      data: {
        status: data.status,
        rejectionReason: data.rejectionReason,
      },
    });
  }
}
