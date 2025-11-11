import {
  CalculateVehiclePriceRequest,
  CalculateVehiclePriceResponse,
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
  constructor(private readonly vehicleService: VehicleService) {}

  @GrpcMethod('VehicleService', 'GetManyVehicles')
  getManyVehicles(
    data: GetManyVehiclesRequest
  ): Promise<GetManyVehiclesResponse> {
    return this.vehicleService.getManyVehicles(data);
  }

  @GrpcMethod('VehicleService', 'GetVehicle')
  getVehicle(data: GetVehicleRequest): Promise<GetVehicleResponse> {
    return this.vehicleService.getVehicleById(data);
  }

  @GrpcMethod('VehicleService', 'CreateVehicle')
  createVehicle(data: CreateVehicleRequest): Promise<GetVehicleResponse> {
    return this.vehicleService.createVehicle(data);
  }

  @GrpcMethod('VehicleService', 'UpdateVehicle')
  updateVehicle(data: UpdateVehicleRequest): Promise<GetVehicleResponse> {
    return this.vehicleService.updateVehicle(data);
  }

  @GrpcMethod('VehicleService', 'DeleteVehicle')
  deleteVehicle(data: DeleteVehicleRequest): Promise<MessageResponse> {
    return this.vehicleService.deleteVehicle(data);
  }

  @GrpcMethod('VehicleService', 'CalculateVehiclePrice')
  calculatePrice(
    data: CalculateVehiclePriceRequest
  ): Promise<CalculateVehiclePriceResponse> {
    return this.vehicleService.calculatePrice(data);
  }
}
