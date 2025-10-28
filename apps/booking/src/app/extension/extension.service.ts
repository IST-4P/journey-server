import {
  CreateExtensionRequest,
  GetExtensionRequest,
  GetManyExtensionsRequest,
  UpdateExtensionRequest,
  UpdateStatusExtensionRequest,
} from '@domain/booking';
import { Injectable } from '@nestjs/common';
import { ExtensionNotFoundException } from './extension.error';
import { ExtensionRepository } from './extension.repo';

@Injectable()
export class ExtensionService {
  constructor(private readonly bookingRepository: ExtensionRepository) {}

  async getManyExtensions(data: GetManyExtensionsRequest) {
    const extensions = await this.bookingRepository.getManyExtensions(data);
    if (extensions.extensions.length === 0) {
      throw ExtensionNotFoundException;
    }
    return extensions;
  }

  async getExtension(data: GetExtensionRequest) {
    const extension = await this.bookingRepository.getExtension(data);
    if (!extension) {
      throw ExtensionNotFoundException;
    }
    return extension;
  }

  createExtension(data: CreateExtensionRequest) {
    return this.bookingRepository.createExtension(data);
  }

  approveExtension(data: UpdateStatusExtensionRequest) {
    return this.bookingRepository.approveExtension(data);
  }

  rejectExtension(data: UpdateStatusExtensionRequest) {
    return this.bookingRepository.rejectExtension(data);
  }

  updateExtension(data: UpdateExtensionRequest) {
    return this.bookingRepository.updateExtension(data);
  }
}
