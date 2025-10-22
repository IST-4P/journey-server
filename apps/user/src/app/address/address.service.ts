import {
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  GetManyAddressRequest,
  UpdateAddressRequest,
} from '@domain/user';
import { Injectable } from '@nestjs/common';
import { AddressNotFoundException } from './address.error';
import { AddressRepository } from './address.repo';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepo: AddressRepository) {}

  async getManyAddressByUserId(data: GetManyAddressRequest) {
    const result = await this.addressRepo.findManyAddressByUserId(data.userId);
    if (result.length === 0) {
      throw AddressNotFoundException;
    }
    return { addresses: result };
  }

  async getAddressById(data: GetAddressRequest) {
    const result = await this.addressRepo.findAddressById(data);
    if (!result) {
      throw AddressNotFoundException;
    }
    return result;
  }

  async createAddress(data: CreateAddressRequest) {
    return this.addressRepo.createAddress(data);
  }

  async updateAddress({ id, userId, ...data }: UpdateAddressRequest) {
    const result = await this.addressRepo.findAddressById({ id, userId });
    if (!result) {
      throw AddressNotFoundException;
    }
    return this.addressRepo.updateAddress({ id, userId: userId! }, data);
  }

  async deleteAddress(data: DeleteAddressRequest) {
    const result = await this.addressRepo.findAddressById(data);
    if (!result) {
      throw AddressNotFoundException;
    }
    await this.addressRepo.deleteAddress(data);
    return { message: 'Message.AddressDeleteSuccessfully' };
  }
}
