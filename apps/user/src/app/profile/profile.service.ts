import {
  GetAllProfilesRequest,
  GetProfileRequest,
  Role,
  UpdateProfileRequest,
} from '@domain/user';
import { Injectable, Logger } from '@nestjs/common';
import { ProfileNotFoundException } from './profile.error';
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
      const existingProfile = await this.profileRepo.findProfileById(
        event.userId
      );

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
        role: event.role as Role,
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

  async getProfile(data: GetProfileRequest) {
    const result = await this.profileRepo.findProfileById(data.userId);

    if (!result) {
      throw ProfileNotFoundException;
    }
    return result;
  }

  async findAllProfiles(query: GetAllProfilesRequest) {
    return this.profileRepo.findAllProfiles(query);
  }

  async updateProfile({ userId, ...data }: UpdateProfileRequest) {
    const result = await this.getProfile({ userId });
    if (!result) {
      throw ProfileNotFoundException;
    }
    return this.profileRepo.updateProfile(userId, data);
  }
}
