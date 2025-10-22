import { MessageResponse } from '@domain/shared';
import {
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  GetAddressResponseDTO,
  GetManyAddressRequest,
  UpdateAddressRequest,
} from '@domain/user';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AddressService } from './address.service';

@Controller()
export class AddressGrpcController {
  constructor(private readonly addressService: AddressService) {}

  @GrpcMethod('UserService', 'GetManyAddress')
  getManyAddress(
    data: GetManyAddressRequest
  ): Promise<{ addresses: GetAddressResponseDTO[] }> {
    return this.addressService.getManyAddressByUserId(data);
  }

  @GrpcMethod('UserService', 'GetAddress')
  getAddress(data: GetAddressRequest): Promise<GetAddressResponseDTO> {
    return this.addressService.getAddressById(data);
  }

  @GrpcMethod('UserService', 'CreateAddress')
  async createAddress(
    data: CreateAddressRequest
  ): Promise<GetAddressResponseDTO> {
    const result = await this.addressService.createAddress(data);
    return {
      ...result,
      latitude: result.latitude ?? undefined,
      longitude: result.longitude ?? undefined,
    };
  }

  @GrpcMethod('UserService', 'UpdateAddress')
  updateAddress(data: UpdateAddressRequest): Promise<GetAddressResponseDTO> {
    return this.addressService.updateAddress(data);
  }

  @GrpcMethod('UserService', 'DeleteAddress')
  deleteAddress(data: DeleteAddressRequest): Promise<MessageResponse> {
    return this.addressService.deleteAddress(data);
  }
}
