import { MessageResponseType } from '@hacmieu-journey/nestjs';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateFeatureRequestType,
  DeleteFeatureRequestType,
  GetAllFeaturesResponseType,
  GetFeatureResponseType,
  UpdateFeatureRequestType,
} from './feature.model';
import { FeatureService } from './feature.service';

@Controller()
export class FeatureGrpcController {
  constructor(private readonly featureService: FeatureService) {}

  @GrpcMethod('VehicleService', 'GetAllFeatures')
  getAllFeatures(): Promise<GetAllFeaturesResponseType> {
    return this.featureService.getAllFeatures();
  }

  @GrpcMethod('VehicleService', 'CreateFeature')
  createFeature(
    data: CreateFeatureRequestType
  ): Promise<GetFeatureResponseType> {
    return this.featureService.createFeature(data);
  }

  @GrpcMethod('VehicleService', 'UpdateFeature')
  updateFeature(
    data: UpdateFeatureRequestType
  ): Promise<GetFeatureResponseType> {
    return this.featureService.updateFeature(data);
  }

  @GrpcMethod('VehicleService', 'DeleteFeature')
  deleteFeature(data: DeleteFeatureRequestType): Promise<MessageResponseType> {
    return this.featureService.deleteFeature(data);
  }
}
