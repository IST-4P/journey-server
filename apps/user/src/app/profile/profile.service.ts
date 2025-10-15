import { Injectable, Logger } from '@nestjs/common';
import { ProfileNotFoundException } from './profile.error';
import {
  GetAllProfilesRequestType,
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
    const result = await this.profileRepo.findProfileById(data.userId);

    if (!result) {
      throw ProfileNotFoundException;
    }
    return result;
  }

  async findAllProfiles(query: GetAllProfilesRequestType) {
    return this.profileRepo.findAllProfiles(query);
  }

  async updateProfile({ userId, ...data }: UpdateProfileRequestType) {
    const result = await this.getProfile({ userId });
    if (!result) {
      throw ProfileNotFoundException;
    }
    return this.profileRepo.updateProfile(userId, data);
  }
}
