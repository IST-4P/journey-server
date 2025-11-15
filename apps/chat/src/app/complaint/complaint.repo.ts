import {
  CreateComplaintMessageRequest,
  CreateComplaintRequest,
  GetManyComplaintMessagesRequest,
  GetManyComplaintsRequest,
  UpdateComplaintStatusRequest,
} from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplaintNotFoundException } from './complaint.error';

@Injectable()
export class ComplaintRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyComplaints({ page, limit, ...where }: GetManyComplaintsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [totalItems, complaints] = await Promise.all([
      this.prismaService.complaint.count({ where }),
      this.prismaService.complaint.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      complaints,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  createComplaint(data: CreateComplaintRequest) {
    return this.prismaService.complaint.create({
      data,
    });
  }

  async updateComplaintStatus(data: UpdateComplaintStatusRequest) {
    const complaint = await this.prismaService.complaint.findUnique({
      where: { id: data.id },
    });
    if (!complaint) {
      throw ComplaintNotFoundException;
    }
    return this.prismaService.complaint.update({
      where: { id: data.id },
      data: { status: data.status },
    });
  }

  async getManyComplaintMessages(data: GetManyComplaintMessagesRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, complaintMessages] = await Promise.all([
      this.prismaService.complaintMessage.count({
        where: { complaintId: data.complaintId },
      }),
      this.prismaService.complaintMessage.findMany({
        where: { complaintId: data.complaintId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
    ]);
    return {
      complaintMessages,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  createComplaintMessage(data: CreateComplaintMessageRequest) {
    return this.prismaService.complaintMessage.create({
      data,
    });
  }
}
