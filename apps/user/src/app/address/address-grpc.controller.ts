import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateAddressRequestType,
  GetAddressRequestType,
  GetAddressResponseType,
  GetManyAddressRequestType,
  UpdateAddressRequestType,
} from './address.model';
import { AddressService } from './address.service';

@Controller()
export class AddressGrpcController {
  constructor(private readonly addressService: AddressService) {}

  @GrpcMethod('UserService', 'GetManyAddress')
  getManyAddress(
    data: GetManyAddressRequestType
  ): Promise<{ addresses: GetAddressResponseType[] }> {
    return this.addressService.getManyAddressByUserId(data);
  }

  @GrpcMethod('UserService', 'GetAddress')
  getAddress(data: GetAddressRequestType): Promise<GetAddressResponseType> {
    return this.addressService.getAddressById(data);
  }

  @GrpcMethod('UserService', 'CreateAddress')
  createAddress(
    data: CreateAddressRequestType
  ): Promise<GetAddressResponseType> {
    return this.addressService.createAddress(data);
  }

  @GrpcMethod('UserService', 'UpdateAddress')
  updateAddress(
    data: UpdateAddressRequestType
  ): Promise<GetAddressResponseType> {
    return this.addressService.updateAddress(data);
  }
}
