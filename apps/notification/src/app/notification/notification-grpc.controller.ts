import { MessageResponseType } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateNotificationRequestType,
  DeleteNotificationRequestType,
  GetManyNotificationsRequestType,
  GetManyNotificationsResponseType,
  GetNotificationRequestType,
  GetNotificationResponseType,
  MarkAsReadRequestType,
} from './notification.model';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationGrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'GetManyNotifications')
  getManyNotifications(
    data: GetManyNotificationsRequestType
  ): Promise<GetManyNotificationsResponseType> {
    return this.notificationService.getManyNotifications(data);
  }

  @GrpcMethod('NotificationService', 'GetNotification')
  getNotification(
    data: GetNotificationRequestType
  ): Promise<GetNotificationResponseType> {
    return this.notificationService.getNotification(data);
  }

  @GrpcMethod('NotificationService', 'CreateNotification')
  createNotification(
    data: CreateNotificationRequestType
  ): Promise<GetNotificationResponseType> {
    return this.notificationService.createNotification(data);
  }

  @GrpcMethod('NotificationService', 'MarkAsReadNotifications')
  markAsReadNotifications(
    data: MarkAsReadRequestType
  ): Promise<MessageResponseType> {
    return this.notificationService.markAsReadNotifications(data);
  }

  @GrpcMethod('NotificationService', 'DeleteNotification')
  deleteNotification(
    data: DeleteNotificationRequestType
  ): Promise<MessageResponseType> {
    return this.notificationService.deleteNotification(data);
  }
}
