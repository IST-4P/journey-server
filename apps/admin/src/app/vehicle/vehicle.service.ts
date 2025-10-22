import { VehicleProto } from '@hacmieu-journey/grpc';
import { NatsClient } from '@hacmieu-journey/nats';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VehicleService implements OnModuleInit {
  private readonly logger = new Logger(VehicleService.name);
  private vehicleService!: VehicleProto.VehicleServiceClient;

  constructor(
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private client: ClientGrpc,
    private readonly natsClient: NatsClient
  ) {}

  onModuleInit() {
    this.vehicleService =
      this.client.getService<VehicleProto.VehicleServiceClient>(
        VehicleProto.VEHICLE_SERVICE_NAME
      );
  }

  //================= Vehicles =================//

  getManyVehicles(
    data: VehicleProto.GetManyVehiclesRequest
  ): Promise<VehicleProto.GetManyVehiclesResponse> {
    return lastValueFrom(this.vehicleService.getManyVehicles(data));
  }

  getVehicle(
    data: VehicleProto.GetVehicleRequest
  ): Promise<VehicleProto.GetVehicleResponse> {
    return lastValueFrom(this.vehicleService.getVehicle(data));
  }

  createVehicle(
    data: VehicleProto.CreateVehicleRequest
  ): Promise<VehicleProto.GetVehicleResponse> {
    return lastValueFrom(this.vehicleService.createVehicle(data));
  }

  updateVehicle(
    data: VehicleProto.UpdateVehicleRequest
  ): Promise<VehicleProto.GetVehicleResponse> {
    return lastValueFrom(this.vehicleService.updateVehicle(data));
  }

  deleteVehicle(
    data: VehicleProto.GetVehicleRequest
  ): Promise<VehicleProto.MessageResponse> {
    return lastValueFrom(this.vehicleService.deleteVehicle(data));
  }

  //================= Features =================//

  getAllFeatures(
    data: VehicleProto.GetAllFeaturesRequest
  ): Promise<VehicleProto.GetAllFeaturesResponse> {
    return lastValueFrom(this.vehicleService.getAllFeatures(data));
  }

  getFeature(
    data: VehicleProto.GetFeatureRequest
  ): Promise<VehicleProto.GetFeatureResponse> {
    return lastValueFrom(this.vehicleService.getFeature(data));
  }

  createFeature(
    data: VehicleProto.CreateFeatureRequest
  ): Promise<VehicleProto.GetFeatureResponse> {
    return lastValueFrom(this.vehicleService.createFeature(data));
  }

  updateFeature(
    data: VehicleProto.UpdateFeatureRequest
  ): Promise<VehicleProto.GetFeatureResponse> {
    return lastValueFrom(this.vehicleService.updateFeature(data));
  }

  deleteFeature(
    data: VehicleProto.GetFeatureRequest
  ): Promise<VehicleProto.MessageResponse> {
    return lastValueFrom(this.vehicleService.deleteFeature(data));
  }

  //================= Models =================//
  getAllModels(
    data: VehicleProto.GetAllModelsRequest
  ): Promise<VehicleProto.GetAllModelsResponse> {
    return lastValueFrom(this.vehicleService.getAllModels(data));
  }

  createModel(
    data: VehicleProto.CreateModelRequest
  ): Promise<VehicleProto.GetModelResponse> {
    return lastValueFrom(this.vehicleService.createModel(data));
  }

  updateModel(
    data: VehicleProto.UpdateModelRequest
  ): Promise<VehicleProto.GetModelResponse> {
    return lastValueFrom(this.vehicleService.updateModel(data));
  }

  deleteModel(
    data: VehicleProto.DeleteModelRequest
  ): Promise<VehicleProto.MessageResponse> {
    return lastValueFrom(this.vehicleService.deleteModel(data));
  }

  //================= Brands =================//
  getAllBrands(
    data: VehicleProto.GetAllBrandsRequest
  ): Promise<VehicleProto.GetAllBrandsResponse> {
    return lastValueFrom(this.vehicleService.getAllBrands(data));
  }

  createBrand(
    data: VehicleProto.CreateBrandRequest
  ): Promise<VehicleProto.GetBrandResponse> {
    return lastValueFrom(this.vehicleService.createBrand(data));
  }

  updateBrand(
    data: VehicleProto.UpdateBrandRequest
  ): Promise<VehicleProto.GetBrandResponse> {
    return lastValueFrom(this.vehicleService.updateBrand(data));
  }

  deleteBrand(
    data: VehicleProto.DeleteBrandRequest
  ): Promise<VehicleProto.MessageResponse> {
    return lastValueFrom(this.vehicleService.deleteBrand(data));
  }
}
