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
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create user profile when receiving event from Auth Service
   */
  async createProfileFromAuthEvent(event: UserRegisteredEvent) {
    try {
      // Check if profile already exists (idempotency)
      const existingProfile = await this.prisma.userProfile.findUnique({
        where: { id: event.userId },
      });

      if (existingProfile) {
        this.logger.warn(
          `Profile already exists for user: ${event.userId}. Skipping creation.`
        );
        return existingProfile;
      }

      // Create new user profile
      const profile = await this.prisma.userProfile.create({
        data: {
          id: event.userId,
          email: event.email,
          fullName: event.name,
          phone: event.phone,
          role: event.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
        },
      });

      // this.logger.log(`✅ Created profile for user: ${event.userId}`);
      return profile;
    } catch (error) {
      this.logger.error(
        `❌ Failed to create profile for user ${event.userId}:`,
        error
      );
      throw error;
    }
  }
}
