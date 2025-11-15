import { NotificationProto, UserProto } from '@hacmieu-journey/grpc';
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
    private userClient: ClientGrpc
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
    return lastValueFrom(this.notificationService.createNotification(data));
  }

  async broadcastNotification(
    data: NotificationProto.BroadcastNotificationRequest
  ): Promise<NotificationProto.BroadcastNotificationResponse> {
    const userIds = await lastValueFrom(this.userService.getAllUserIds({}));
    data.userIds = userIds.userIds;
    return lastValueFrom(this.notificationService.broadcastNotification(data));
  }
}
