import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetAllProfilesRequestType,
  GetAllProfilesResponseType,
  GetProfileRequestType,
  GetProfileResponseType,
  UpdateProfileRequestType,
} from './profile.model';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileGrpcController {
  constructor(private readonly profileService: ProfileService) {}

  @GrpcMethod('UserService', 'GetProfile')
  getProfile(data: GetProfileRequestType): Promise<GetProfileResponseType> {
    return this.profileService.getProfile(data);
  }

  @GrpcMethod('UserService', 'FindAllProfiles')
  findAllProfiles(
    data: GetAllProfilesRequestType
  ): Promise<GetAllProfilesResponseType> {
    return this.profileService.findAllProfiles(data);
  }

  @GrpcMethod('UserService', 'UpdateProfile')
  updateProfile(data: UpdateProfileRequestType) {
    return this.profileService.updateProfile(data);
  }
}
