import {
  BroadcastNotificationRequest,
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetManyNotificationsRequest,
  GetNotificationRequest,
  MarkAsReadRequest,
} from '@domain/notification';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationNotFoundException } from './notification.error';
import { NotificationRepository } from './notification.repo';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly notificationRepo: NotificationRepository) {}

  createNotificationFromAuthEvent(event: UserRegisteredEvent) {
    try {
      const data = {
        userId: event.userId,
        title: 'Welcome to HacMieu Journey!',
        content: `Welcome to HacMieu Journey, ${event.name}!`,
        type: 'WELCOME' as const,
      };

      return this.notificationRepo.createNotification(data);
    } catch (error) {
      this.logger.error(
        `❌ Failed to create notification for user ${event.userId}:`,
        error
      );
      throw error;
    }
  }

  async getManyNotifications(data: GetManyNotificationsRequest) {
    const notifications = await this.notificationRepo.getManyNotifications(
      data
    );
    if (notifications.notifications.length == 0) {
      throw NotificationNotFoundException;
    }
    return notifications;
  }

  async getNotification(data: GetNotificationRequest) {
    const notification = await this.notificationRepo.getNotificationById(data);
    if (!notification) {
      throw NotificationNotFoundException;
    }
    return notification;
  }

  createNotification(data: CreateNotificationRequest) {
    return this.notificationRepo.createNotification(data);
  }

  async markAsReadNotifications(data: MarkAsReadRequest) {
    await this.notificationRepo.makeAsRead(data);
    return {
      message: 'Message.MarkAsReadSuccessfully',
    };
  }

  async deleteNotification(data: DeleteNotificationRequest) {
    const result = await this.notificationRepo.getNotificationById(data);
    if (!result) {
      throw NotificationNotFoundException;
    }
    await this.notificationRepo.deleteNotification(data);
    return {
      message: 'Message.DeleteNotificationSuccessfully',
    };
  }

  broadcastNotification(data: BroadcastNotificationRequest) {
    return this.notificationRepo.broadcastNotification(data);
  }
}
