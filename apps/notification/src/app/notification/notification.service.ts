import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotificationFromAuthEvent(event: UserRegisteredEvent) {
    try {
      // Create welcome notification for the new user
      await this.prisma.notification.create({
        data: {
          userId: event.userId,
          title: 'Welcome to HacMieu Journey!',
          message: `Welcome to HacMieu Journey, ${event.name}!`,
          type: 'WELCOME',
        },
      });

      // this.logger.log(`✅ Created notification for user: ${event.userId}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to create notification for user ${event.userId}:`,
        error
      );
      throw error;
    }
  }
}
