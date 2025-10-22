import { NotificationProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationService!: NotificationProto.NotificationServiceClient;

  constructor(
    @Inject(NotificationProto.NOTIFICATION_PACKAGE_NAME)
    private client: ClientGrpc
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

  markAllAsRead(
    data: NotificationProto.MarkAsReadRequest
  ): Promise<NotificationProto.MessageResponse> {
    return lastValueFrom(
      this.notificationService.markAsReadNotifications(data)
    );
  }

  deleteNotification(
    data: NotificationProto.DeleteNotificationRequest
  ): Promise<NotificationProto.MessageResponse> {
    return lastValueFrom(this.notificationService.deleteNotification(data));
  }
}
