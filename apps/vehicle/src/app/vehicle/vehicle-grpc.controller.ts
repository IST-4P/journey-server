import { MessageResponseType } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateVehicleRequestType,
  DeleteVehicleRequestType,
  GetManyVehiclesRequestType,
  GetManyVehiclesResponseType,
  GetVehicleRequestType,
  GetVehicleResponseType,
  UpdateVehicleRequestType,
} from './vehicle.model';
import { VehicleService } from './vehicle.service';

@Controller()
export class VehicleGrpcController {
  constructor(private readonly featureService: VehicleService) {}

  @GrpcMethod('VehicleService', 'GetManyVehicles')
  getManyVehicles(
    data: GetManyVehiclesRequestType
  ): Promise<GetManyVehiclesResponseType> {
    return this.featureService.getManyVehicles(data);
  }

  @GrpcMethod('VehicleService', 'GetVehicle')
  getVehicle(data: GetVehicleRequestType): Promise<GetVehicleResponseType> {
    return this.featureService.getVehicleById(data);
  }

  @GrpcMethod('VehicleService', 'CreateVehicle')
  createVehicle(
    data: CreateVehicleRequestType
  ): Promise<GetVehicleResponseType> {
    return this.featureService.createVehicle(data);
  }

  @GrpcMethod('VehicleService', 'UpdateVehicle')
  updateVehicle(
    data: UpdateVehicleRequestType
  ): Promise<GetVehicleResponseType> {
    return this.featureService.updateVehicle(data);
  }

  @GrpcMethod('VehicleService', 'DeleteVehicle')
  deleteVehicle(data: DeleteVehicleRequestType): Promise<MessageResponseType> {
    return this.featureService.deleteVehicle(data);
  }
}
