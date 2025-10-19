import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  CreateNotificationRequestDTO,
  DeleteNotificationQueryDTO,
  GetManyNotificationsQueryDTO,
  GetNotificationQueryDTO,
} from './notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  // private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get('detail')
  getNotification(@Query() query: GetNotificationQueryDTO) {
    return this.notificationService.getNotification(query);
  }

  @Get('list')
  getManyNotifications(@Query() query: GetManyNotificationsQueryDTO) {
    return this.notificationService.getManyNotifications(query);
  }

  @Post()
  createNotification(@Body() body: CreateNotificationRequestDTO) {
    return this.notificationService.createNotification(body);
  }

  @Delete(':id')
  deleteNotification(@Query() query: DeleteNotificationQueryDTO) {
    return this.notificationService.deleteNotification(query);
  }
}
