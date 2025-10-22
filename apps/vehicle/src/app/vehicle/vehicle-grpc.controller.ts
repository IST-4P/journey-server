import {
  CreateVehicleRequest,
  DeleteVehicleRequest,
  GetManyVehiclesRequest,
  GetManyVehiclesResponse,
  GetVehicleRequest,
  GetVehicleResponse,
  UpdateVehicleRequest,
} from '@domain/vehicle';
import { MessageResponse } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VehicleService } from './vehicle.service';

@Controller()
export class VehicleGrpcController {
  constructor(private readonly featureService: VehicleService) {}

  @GrpcMethod('VehicleService', 'GetManyVehicles')
  getManyVehicles(
    data: GetManyVehiclesRequest
  ): Promise<GetManyVehiclesResponse> {
    return this.featureService.getManyVehicles(data);
  }

  @GrpcMethod('VehicleService', 'GetVehicle')
  getVehicle(data: GetVehicleRequest): Promise<GetVehicleResponse> {
    return this.featureService.getVehicleById(data);
  }

  @GrpcMethod('VehicleService', 'CreateVehicle')
  createVehicle(data: CreateVehicleRequest): Promise<GetVehicleResponse> {
    return this.featureService.createVehicle(data);
  }

  @GrpcMethod('VehicleService', 'UpdateVehicle')
  updateVehicle(data: UpdateVehicleRequest): Promise<GetVehicleResponse> {
    return this.featureService.updateVehicle(data);
  }

  @GrpcMethod('VehicleService', 'DeleteVehicle')
  deleteVehicle(data: DeleteVehicleRequest): Promise<MessageResponse> {
    return this.featureService.deleteVehicle(data);
  }
}
