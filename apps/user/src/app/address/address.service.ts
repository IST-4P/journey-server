import { isNotFoundPrismaError } from '@hacmieu-journey/prisma';
import { Injectable } from '@nestjs/common';
import {
  AddressNotFoundException,
  UnauthorizedAccessException,
} from './address.error';
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
    try {
      const result = await this.addressRepo.findManyAddressByUserId(
        data.userId
      );
      return { addresses: result };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw AddressNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async getAddressById(data: GetAddressRequestType) {
    try {
      const result = await this.addressRepo.findAddressById(data);
      return result;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw AddressNotFoundException;
      }

      throw UnauthorizedAccessException;
    }
  }

  async createAddress(data: CreateAddressRequestType) {
    return this.addressRepo.createAddress(data);
  }

  async updateAddress({ id, userId, ...data }: UpdateAddressRequestType) {
    return this.addressRepo.updateAddress({ id, userId: userId! }, data);
  }
}
