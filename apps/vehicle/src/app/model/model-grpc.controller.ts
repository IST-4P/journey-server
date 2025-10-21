import { MessageResponse } from '@domain/shared';
import {
  CreateModelRequest,
  DeleteModelRequest,
  GetAllModelsRequest,
  GetAllModelsResponse,
  GetModelResponse,
  UpdateModelRequest,
} from '@domain/vehicle';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ModelService } from './model.service';

@Controller()
export class ModelGrpcController {
  constructor(private readonly modelService: ModelService) {}

  @GrpcMethod('VehicleService', 'GetAllModels')
  getAllModels(data: GetAllModelsRequest): Promise<GetAllModelsResponse> {
    return this.modelService.getAllModels(data);
  }

  @GrpcMethod('VehicleService', 'CreateModel')
  createModel(data: CreateModelRequest): Promise<GetModelResponse> {
    return this.modelService.createModel(data);
  }

  @GrpcMethod('VehicleService', 'UpdateModel')
  updateModel(data: UpdateModelRequest): Promise<GetModelResponse> {
    return this.modelService.updateModel(data);
  }

  @GrpcMethod('VehicleService', 'DeleteModel')
  deleteModel(data: DeleteModelRequest): Promise<MessageResponse> {
    return this.modelService.deleteModel(data);
  }
}
