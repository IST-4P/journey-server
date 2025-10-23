import {
  CreateExtensionRequest,
  GetExtensionRequest,
  GetExtensionResponse,
  GetManyExtensionsRequest,
  GetManyExtensionsResponse,
  UpdateStatusExtensionRequest,
} from '@domain/booking';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExtensionService } from './extension.service';

@Controller()
export class ExtensionGrpcController {
  constructor(private readonly bookingService: ExtensionService) {}

  @GrpcMethod('BookingService', 'GetManyExtensions')
  getManyExtensions(
    data: GetManyExtensionsRequest
  ): Promise<GetManyExtensionsResponse> {
    return this.bookingService.getManyExtensions(data);
  }

  @GrpcMethod('BookingService', 'GetExtension')
  getExtension(data: GetExtensionRequest): Promise<GetExtensionResponse> {
    return this.bookingService.getExtension(data);
  }

  @GrpcMethod('BookingService', 'CreateExtension')
  createExtension(data: CreateExtensionRequest): Promise<GetExtensionResponse> {
    return this.bookingService.createExtension(data);
  }

  @GrpcMethod('BookingService', 'UpdateStatusExtension')
  updateStatusExtension(
    data: UpdateStatusExtensionRequest
  ): Promise<GetExtensionResponse> {
    return this.bookingService.updateStatusExtension(data);
  }
}
