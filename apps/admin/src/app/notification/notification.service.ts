import { NotificationProto, UserProto } from '@hacmieu-journey/grpc';
import { NatsClient } from '@hacmieu-journey/nats';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private notificationService!: NotificationProto.NotificationServiceClient;
  private userService!: UserProto.UserServiceClient;

  constructor(
    @Inject(NotificationProto.NOTIFICATION_PACKAGE_NAME)
    private notificationClient: ClientGrpc,
    @Inject(UserProto.USER_PACKAGE_NAME)
    private userClient: ClientGrpc,
    private readonly natsClient: NatsClient
  ) {}

  onModuleInit() {
    this.notificationService =
      this.notificationClient.getService<NotificationProto.NotificationServiceClient>(
        NotificationProto.NOTIFICATION_SERVICE_NAME
      );
    this.userService = this.userClient.getService<UserProto.UserServiceClient>(
      UserProto.USER_SERVICE_NAME
    );
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
      };

      // this.logger.log(
      //   `🚀 Publishing notification.created event: ${JSON.stringify(
      //     notificationData
      //   )}`
      // );

      await this.natsClient.publish(
        'journey.events.notification-created',
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

  async broadcastNotification(
    data: NotificationProto.BroadcastNotificationRequest
  ): Promise<NotificationProto.BroadcastNotificationResponse> {
    const userIds = await lastValueFrom(this.userService.getAllUserIds({}));
    data.userIds = userIds.userIds;
    return lastValueFrom(this.notificationService.broadcastNotification(data));
  }
}
