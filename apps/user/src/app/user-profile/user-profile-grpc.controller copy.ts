import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetUserProfileRequestType,
  GetUserProfileResponseType,
  UpdateUserProfileRequestType,
} from './user-profile.model';
import { UserProfileService } from './user-profile.service';

@Controller()
export class UserProfileGrpcController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @GrpcMethod('UserProfileService', 'GetUserProfile')
  getUserProfile(
    data: GetUserProfileRequestType
  ): Promise<GetUserProfileResponseType> {
    return this.userProfileService.getProfile(data);
  }

  @GrpcMethod('UserProfileService', 'UpdateUserProfile')
  updateUserProfile(
    data: UpdateUserProfileRequestType
  ): Promise<GetUserProfileResponseType> {
    return this.userProfileService.updateProfile(data.userId, data);
  }
}
