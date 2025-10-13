import { Injectable } from '@nestjs/common';
import { AddressNotFoundException } from './address.error';
import {
  CreateAddressRequestType,
  GetAddressRequestType,
  GetManyAddressRequestType,
  UpdateAddressRequestType,
} from './address.model';
import { AddressRepository } from './address.repo';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepository) {}

  async getManyAddressByUserId(data: GetManyAddressRequestType) {
    const result = await this.addressRepo.findManyAddressByUserId(data.userId);
    if (result.length === 0) {
      throw AddressNotFoundException;
    }
    return { addresses: result };
  }

  async getAddressById(data: GetAddressRequestType) {
    const result = await this.addressRepo.findAddressById(data);
    if (!result) {
      throw AddressNotFoundException;
    }
    return result;
  }

  async createAddress(data: CreateAddressRequestType) {
    return this.addressRepo.createAddress(data);
  }

  async updateAddress({ id, userId, ...data }: UpdateAddressRequestType) {
    const result = await this.getAddressById({ id, userId });
    if (!result) {
      throw AddressNotFoundException;
    }
    return this.addressRepo.updateAddress({ id, userId: userId! }, data);
  }
}
