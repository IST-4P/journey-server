import { MessageResponse } from '@domain/shared';
import {
  CreateFeatureRequest,
  DeleteFeatureRequest,
  GetAllFeaturesResponse,
  GetFeatureResponse,
  UpdateFeatureRequest,
} from '@domain/vehicle';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FeatureService } from './feature.service';

@Controller()
export class FeatureGrpcController {
  constructor(private readonly featureService: FeatureService) {}

  @GrpcMethod('VehicleService', 'GetAllFeatures')
  getAllFeatures(): Promise<GetAllFeaturesResponse> {
    return this.featureService.getAllFeatures();
  }

  @GrpcMethod('VehicleService', 'CreateFeature')
  createFeature(data: CreateFeatureRequest): Promise<GetFeatureResponse> {
    return this.featureService.createFeature(data);
  }

  @GrpcMethod('VehicleService', 'UpdateFeature')
  updateFeature(data: UpdateFeatureRequest): Promise<GetFeatureResponse> {
    return this.featureService.updateFeature(data);
  }

  @GrpcMethod('VehicleService', 'DeleteFeature')
  deleteFeature(data: DeleteFeatureRequest): Promise<MessageResponse> {
    return this.featureService.deleteFeature(data);
  }
}
