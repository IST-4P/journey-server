import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/notification';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetManyNotificationsRequestType,
  MarkAsReadRequestType,
} from './notification.model';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  getManyNotifications(data: GetManyNotificationsRequestType) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    return this.prisma.notification.findMany({
      where: { userId: data.userId },
      select: {
        id: true,
        title: true,
        type: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  getNotificationById({ id, userId }: Prisma.NotificationWhereUniqueInput) {
    return this.prisma.notification.findUnique({
      where: { id, userId },
    });
  }

  makeAsRead(data: MarkAsReadRequestType) {
    return this.prisma.notification.updateMany({
      where: {
        userId: data.userId,
        id: { in: data.notificationIds },
      },
      data: { read: true },
    });
  }

  createNotification(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({
      data,
    });
  }

  deleteNotification({ id, userId }: Prisma.NotificationWhereUniqueInput) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }
}
