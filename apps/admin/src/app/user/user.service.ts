import { UserProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  private userService!: UserProto.UserServiceClient;

  constructor(
    @Inject(UserProto.USER_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserProto.UserServiceClient>(
      UserProto.USER_SERVICE_NAME
    );
  }

  async getProfile(
    data: UserProto.GetProfileRequest
  ): Promise<UserProto.GetProfileResponse> {
    return lastValueFrom(this.userService.getProfile(data));
  }

  async findAllProfiles(
    data: UserProto.FindAllProfilesRequest
  ): Promise<UserProto.FindAllProfilesResponse> {
    return lastValueFrom(this.userService.findAllProfiles(data));
  }

  async updateProfile(
    data: UserProto.UpdateProfileRequest
  ): Promise<UserProto.GetProfileResponse> {
    return lastValueFrom(this.userService.updateProfile(data));
  }

  async getDriverLicense(
    data: UserProto.GetDriverLicenseRequest
  ): Promise<UserProto.GetDriverLicenseResponse> {
    return lastValueFrom(this.userService.getDriverLicense(data));
  }

  async updateDriverLicense(
    data: UserProto.UpdateDriverLicenseRequest
  ): Promise<UserProto.GetDriverLicenseResponse> {
    return lastValueFrom(this.userService.updateDriverLicense(data));
  }

  async verifyDriverLicense(
    data: UserProto.VerifyDriverLicenseRequest
  ): Promise<UserProto.GetDriverLicenseResponse> {
    return lastValueFrom(this.userService.verifyDriverLicense(data));
  }

  async getBankAccount(
    data: UserProto.GetBankAccountRequest
  ): Promise<UserProto.GetBankAccountResponse> {
    return lastValueFrom(this.userService.getBankAccount(data));
  }

  async updateBankAccount(
    data: UserProto.UpdateBankAccountRequest
  ): Promise<UserProto.GetBankAccountResponse> {
    return lastValueFrom(this.userService.updateBankAccount(data));
  }

  async getAddress(
    data: UserProto.GetAddressRequest
  ): Promise<UserProto.GetAddressResponse> {
    return lastValueFrom(this.userService.getAddress(data));
  }

  async getManyAddress(
    data: UserProto.GetManyAddressRequest
  ): Promise<UserProto.GetManyAddressResponse> {
    return lastValueFrom(this.userService.getManyAddress(data));
  }

  async updateAddress(
    data: UserProto.UpdateAddressRequest
  ): Promise<UserProto.GetAddressResponse> {
    return lastValueFrom(this.userService.updateAddress(data));
  }

  async deleteAddress(
    data: UserProto.DeleteAddressRequest
  ): Promise<UserProto.DeleteAddressResponse> {
    return lastValueFrom(this.userService.deleteAddress(data));
  }
}
