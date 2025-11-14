import {
  BroadcastNotificationDTO,
  CreateNotificationRequestDTO,
} from '@domain/notification';
import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  // private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('broadcast')
  broadcastNotification(
    @Body() body: Omit<BroadcastNotificationDTO, 'userIds'>
  ) {
    return this.notificationService.broadcastNotification({
      ...body,
      userIds: [],
    });
  }

  @Post()
  createNotification(@Body() body: CreateNotificationRequestDTO) {
    return this.notificationService.createNotification(body);
  }
}
