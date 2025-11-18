import {
  ComplaintMessageTypeValues,
  CreateComplaintMessageRequest,
  CreateComplaintRequest,
  GetManyComplaintMessagesRequest,
  GetManyComplaintsRequest,
  UpdateComplaintStatusRequest,
} from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/chat';
import { PrismaService } from '../prisma/prisma.service';
import { ComplaintNotFoundException } from './complaint.error';

@Injectable()
export class ComplaintRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getManyComplaints({ page, limit, ...where }: GetManyComplaintsRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    // Build WHERE conditions - sử dụng Prisma.sql để join
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

    if (where.status) {
      // Cast enum sang text để so sánh
      conditions.push(Prisma.sql`c.status::text = ${where.status}`);
    }

    if (where.userId) {
      conditions.push(Prisma.sql`c."userId" = ${where.userId}`);
    }

    // Join conditions với AND
    const whereClause = Prisma.join(conditions, ' AND ');

    // Lấy complaints với lastMessage (chỉ lấy content và createdAt)
    const complaints$ = this.prismaService.$queryRaw<
      Array<{
        id: string;
        userId: string;
        title: string;
        status: string;
        createdAt: Date;
        lastMessage: string;
        lastMessageAt: Date;
      }>
    >(Prisma.sql`
    WITH LastMessages AS (
      SELECT 
        cm."complaintId",
        cm."content" as "lastMessage",
        cm."createdAt" as "lastMessageAt",
        ROW_NUMBER() OVER (PARTITION BY cm."complaintId" ORDER BY cm."createdAt" DESC) as rn
      FROM "ComplaintMessage" cm
    )
    SELECT 
      c.id,
      c."userId",
      c.title,
      c.status::text as status,
      c."createdAt",
      lm."lastMessage",
      lm."lastMessageAt"
    FROM "Complaint" c
    LEFT JOIN LastMessages lm ON lm."complaintId" = c.id AND lm.rn = 1
    WHERE ${whereClause}
    ORDER BY lm."lastMessageAt" DESC NULLS LAST, c."createdAt" DESC
    LIMIT ${take}
    OFFSET ${skip}
  `);

    // Count total
    const totalCount$ = this.prismaService.$queryRaw<
      Array<{ count: bigint }>
    >(Prisma.sql`
    SELECT COUNT(*) as count
    FROM "Complaint" c
    WHERE ${whereClause}
  `);

    const [totalCount, complaints] = await Promise.all([
      totalCount$,
      complaints$,
    ]);

    const totalItems = Number(totalCount[0].count);

    return {
      complaints: complaints.map((c) => ({
        complaintId: c.id,
        userId: c.userId,
        title: c.title,
        status: c.status,
        createdAt: c.createdAt,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      })),
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async createComplaint(data: CreateComplaintRequest) {
    const complaint = await this.prismaService.complaint.create({
      data,
    });
    await this.prismaService.complaintMessage.create({
      data: {
        complaintId: complaint.id,
        senderId: data.userId,
        content: 'Khách hàng đã tạo yêu cầu hỗ trợ',
        messageType: ComplaintMessageTypeValues.TEXT,
      },
    });
    return complaint;
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
        orderBy: { createdAt: 'desc' },
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
