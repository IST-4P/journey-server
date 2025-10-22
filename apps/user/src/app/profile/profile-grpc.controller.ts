import {
  GetAllProfilesRequest,
  GetAllProfilesResponse,
  GetProfileRequest,
  GetProfileResponse,
  UpdateProfileRequest,
} from '@domain/user';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileGrpcController {
  constructor(private readonly profileService: ProfileService) {}

  @GrpcMethod('UserService', 'GetProfile')
  getProfile(data: GetProfileRequest): Promise<GetProfileResponse> {
    return this.profileService.getProfile(data);
  }

  @GrpcMethod('UserService', 'FindAllProfiles')
  findAllProfiles(
    data: GetAllProfilesRequest
  ): Promise<GetAllProfilesResponse> {
    return this.profileService.findAllProfiles(data);
  }

  @GrpcMethod('UserService', 'UpdateProfile')
  updateProfile(data: UpdateProfileRequest) {
    return this.profileService.updateProfile(data);
  }
}
