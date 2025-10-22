import { NotificationProto } from '@hacmieu-journey/grpc';
import { NatsClient } from '@hacmieu-journey/nats';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private notificationService!: NotificationProto.NotificationServiceClient;

  constructor(
    @Inject(NotificationProto.NOTIFICATION_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly natsClient: NatsClient
  ) {}

  onModuleInit() {
    this.notificationService =
      this.client.getService<NotificationProto.NotificationServiceClient>(
        NotificationProto.NOTIFICATION_SERVICE_NAME
      );
  }

  getNotification(
    data: NotificationProto.GetNotificationRequest
  ): Promise<NotificationProto.GetNotificationResponse> {
    return lastValueFrom(this.notificationService.getNotification(data));
  }

  getManyNotifications(
    data: NotificationProto.GetManyNotificationsRequest
  ): Promise<NotificationProto.GetManyNotificationsResponse> {
    return lastValueFrom(this.notificationService.getManyNotifications(data));
  }

  async createNotification(
    data: NotificationProto.CreateNotificationRequest
  ): Promise<NotificationProto.GetNotificationResponse> {
    const notification = await lastValueFrom(
      this.notificationService.createNotification(data)
    );

    try {
      const notificationData = {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        createdAt: notification.createdAt,
      };

      // this.logger.log(
      //   `🚀 Publishing notification.created event: ${JSON.stringify(
      //     notificationData
      //   )}`
      // );

      await this.natsClient.publish(
        'journey.notifications.notification-created',
        notificationData
      );
    } catch (natsError) {
      // Log error but don't fail registration
      this.logger.error(
        `❌ Failed to publish notification.created event:`,
        natsError
      );
    }

    return notification;
  }

  deleteNotification(
    data: NotificationProto.DeleteNotificationRequest
  ): Promise<NotificationProto.MessageResponse> {
    return lastValueFrom(this.notificationService.deleteNotification(data));
  }
}
