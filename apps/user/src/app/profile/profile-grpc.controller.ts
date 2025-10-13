import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GetProfileRequestType,
  GetProfileResponseType,
  UpdateProfileRequestType,
} from './profile.model';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileGrpcController {
  constructor(private readonly ProfileService: ProfileService) {}

  @GrpcMethod('UserService', 'GetProfile')
  getProfile(data: GetProfileRequestType): Promise<GetProfileResponseType> {
    return this.ProfileService.getProfile(data);
  }

  @GrpcMethod('UserService', 'UpdateProfile')
  updateProfile(data: UpdateProfileRequestType) {
    return this.ProfileService.updateProfile(data);
  }
}
