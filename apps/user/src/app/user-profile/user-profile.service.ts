import { isNotFoundPrismaError } from '@hacmieu-journey/prisma';
import { Injectable, Logger } from '@nestjs/common';
import {
  UnauthorizedAccessException,
  UserProfileNotFoundException,
} from './user-profile.error';
import {
  GetUserProfileRequestType,
  RoleEnumType,
  UpdateUserProfileRequestType,
} from './user-profile.model';
import { UserProfileRepository } from './user-profile.repo';

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

  constructor(private readonly userProfileRepo: UserProfileRepository) {}

  async createProfileFromAuthEvent(event: UserRegisteredEvent) {
    try {
      const existingProfile = await this.userProfileRepo.findProfileById({
        id: event.userId,
      });

      if (existingProfile) {
        this.logger.warn(
          `Profile already exists for user: ${event.userId}. Skipping creation.`
        );
        return existingProfile;
      }
      const profile = await this.userProfileRepo.createProfile({
        id: event.userId,
        email: event.email,
        fullName: event.name,
        phone: event.phone,
        role: event.role as RoleEnumType,
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

  async getProfile(data: GetUserProfileRequestType) {
    try {
      return this.userProfileRepo.findProfileById({ id: data.userId });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserProfileNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async updateProfile(userId: string, data: UpdateUserProfileRequestType) {
    return this.userProfileRepo.updateProfile(userId, data);
  }
}
