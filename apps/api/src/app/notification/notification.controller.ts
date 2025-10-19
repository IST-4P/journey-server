import { ActiveUser } from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  GetManyNotificationsQueryDTO,
  MarkAsReadRequestDTO,
} from './notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  // private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get('list')
  getManyNotifications(
    @ActiveUser('userId') userId: string,
    @Query() query: GetManyNotificationsQueryDTO
  ) {
    return this.notificationService.getManyNotifications({
      userId,
      ...query,
    });
  }

  @Get(':id')
  getNotification(
    @ActiveUser('userId') userId: string,
    @Param('id') id: string
  ) {
    return this.notificationService.getNotification({
      userId,
      id,
    });
  }

  @Put()
  markAsRead(
    @ActiveUser('userId') userId: string,
    @Body() body: MarkAsReadRequestDTO
  ) {
    return this.notificationService.markAllAsRead({
      userId,
      ...body,
    });
  }

  @Delete(':id')
  deleteNotification(
    @ActiveUser('userId') userId: string,
    @Param('id') id: string
  ) {
    return this.notificationService.deleteNotification({
      userId,
      id,
    });
  }
}
