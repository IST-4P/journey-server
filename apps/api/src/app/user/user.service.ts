import { UserProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserProto.UserServiceClient;

  constructor(
    @Inject(UserProto.USER_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserProto.UserServiceClient>(
      UserProto.USER_SERVICE_NAME
    );
  }

  async getUserProfile(
    data: UserProto.GetUserProfileRequest
  ): Promise<UserProto.GetUserProfileResponse> {
    return lastValueFrom(this.userService.getUserProfile(data));
  }

  async updateUserProfile(
    data: UserProto.UpdateUserProfileRequest
  ): Promise<UserProto.GetUserProfileResponse> {
    return lastValueFrom(this.userService.updateUserProfile(data));
  }
}
