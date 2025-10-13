import { isNotFoundPrismaError } from '@hacmieu-journey/prisma';
import { Injectable, Logger } from '@nestjs/common';
import {
  ProfileNotFoundException,
  UnauthorizedAccessException,
} from './profile.error';
import {
  GetProfileRequestType,
  RoleEnumType,
  UpdateProfileRequestType,
} from './profile.model';
import { ProfileRepository } from './profile.repo';

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly profileRepo: ProfileRepository) {}

  async createProfileFromAuthEvent(event: UserRegisteredEvent) {
    try {
      const existingProfile = await this.profileRepo.findProfileById({
        id: event.userId,
      });

      if (existingProfile) {
        this.logger.warn(
          `Profile already exists for user: ${event.userId}. Skipping creation.`
        );
        return existingProfile;
      }
      const profile = await this.profileRepo.createProfile({
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

  async getProfile(data: GetProfileRequestType) {
    try {
      return this.profileRepo.findProfileById({ id: data.userId });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProfileNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async updateProfile({ userId, ...data }: UpdateProfileRequestType) {
    return this.profileRepo.updateProfile(userId, data);
  }
}
