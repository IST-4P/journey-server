import {
  BroadcastNotificationRequest,
  CreateNotificationRequest,
  GetManyNotificationsRequest,
  MarkAsReadRequest,
} from '@domain/notification';
import { NatsClient } from '@hacmieu-journey/nats';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/notification';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly natsClient: NatsClient
  ) {}

  async getManyNotifications(data: GetManyNotificationsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: { userId: data.userId },
      }),
      this.prisma.notification.findMany({
        where: { userId: data.userId },
        select: {
          id: true,
          title: true,
          type: true,
          content: true,
          read: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      notifications,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  getNotificationById({ id, userId }: Prisma.NotificationWhereUniqueInput) {
    return this.prisma.notification.findUnique({
      where: { id, userId },
    });
  }

  makeAsRead(data: MarkAsReadRequest) {
    return this.prisma.notification.updateMany({
      where: {
        userId: data.userId,
        id: { in: data.notificationIds },
      },
      data: { read: true },
    });
  }

  createNotification(data: CreateNotificationRequest) {
    return this.prisma.notification.create({
      data,
    });
  }

  deleteNotification({ id, userId }: Prisma.NotificationWhereUniqueInput) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  async broadcastNotification(data: BroadcastNotificationRequest) {
    const BATCH_SIZE = 1000; // Tạo notifications cho 1000 users mỗi batch
    const { userIds, type, title, content } = data;

    // Chia userIds thành các batches
    const batches: string[][] = [];
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      batches.push(userIds.slice(i, i + BATCH_SIZE));
    }

    // Xử lý từng batch
    const results = [];
    for (const batch of batches) {
      const notificationsData = batch.map((userId) => ({
        userId,
        type,
        title,
        content,
      }));

      // Sử dụng createMany để insert nhiều records cùng lúc (hiệu quả hơn createNotification từng cái)
      const result = await this.prisma.notification.createMany({
        data: notificationsData,
        skipDuplicates: true,
      });

      // Publish event cho mỗi notification được tạo (parallel để nhanh hơn)
      await Promise.all(
        notificationsData.map((notificationData) =>
          this.natsClient.publish('journey.events.notification-announced', {
            userId: notificationData.userId,
            title: notificationData.title,
            content: notificationData.content,
            type: notificationData.type,
          })
        )
      );

      results.push(result);
    }

    // Trả về tổng số notifications đã tạo
    return {
      totalCreated: results.reduce((sum, r) => sum + r.count, 0),
      message: 'Message.BroadcastNotificationSuccessfully',
    };
  }
}
