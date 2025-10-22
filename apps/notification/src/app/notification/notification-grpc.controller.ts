import {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetManyNotificationsRequest,
  GetManyNotificationsResponse,
  GetNotificationRequest,
  GetNotificationResponse,
  MarkAsReadRequest,
} from '@domain/notification';
import { MessageResponse } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationGrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'GetManyNotifications')
  getManyNotifications(
    data: GetManyNotificationsRequest
  ): Promise<GetManyNotificationsResponse> {
    return this.notificationService.getManyNotifications(data);
  }

  @GrpcMethod('NotificationService', 'GetNotification')
  getNotification(
    data: GetNotificationRequest
  ): Promise<GetNotificationResponse> {
    return this.notificationService.getNotification(data);
  }

  @GrpcMethod('NotificationService', 'CreateNotification')
  createNotification(
    data: CreateNotificationRequest
  ): Promise<GetNotificationResponse> {
    return this.notificationService.createNotification(data);
  }

  @GrpcMethod('NotificationService', 'MarkAsReadNotifications')
  markAsReadNotifications(data: MarkAsReadRequest): Promise<MessageResponse> {
    return this.notificationService.markAsReadNotifications(data);
  }

  @GrpcMethod('NotificationService', 'DeleteNotification')
  deleteNotification(
    data: DeleteNotificationRequest
  ): Promise<MessageResponse> {
    return this.notificationService.deleteNotification(data);
  }
}
