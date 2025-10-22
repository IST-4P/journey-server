import {
  CreateNotificationRequestDTO,
  DeleteNotificationRequestDTO,
  GetManyNotificationsRequestDTO,
  GetNotificationRequestDTO,
} from '@domain/notification';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  // private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get('detail')
  getNotification(@Query() query: GetNotificationRequestDTO) {
    return this.notificationService.getNotification(query);
  }

  @Get('list')
  getManyNotifications(@Query() query: GetManyNotificationsRequestDTO) {
    return this.notificationService.getManyNotifications(query);
  }

  @Post()
  createNotification(@Body() body: CreateNotificationRequestDTO) {
    return this.notificationService.createNotification(body);
  }

  @Delete(':id')
  deleteNotification(@Query() query: DeleteNotificationRequestDTO) {
    return this.notificationService.deleteNotification(query);
  }
}
