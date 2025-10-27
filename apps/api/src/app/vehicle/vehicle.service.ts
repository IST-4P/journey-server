import { VehicleProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VehicleService implements OnModuleInit {
  private readonly logger = new Logger(VehicleService.name);
  private vehicleService!: VehicleProto.VehicleServiceClient;

  constructor(
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private client: ClientGrpc
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

  //================= Features =================//

  getAllFeatures(
    data: VehicleProto.GetAllFeaturesRequest
  ): Promise<VehicleProto.GetAllFeaturesResponse> {
    return lastValueFrom(this.vehicleService.getAllFeatures(data));
  }

  //================= Models =================//
  getAllModels(
    data: VehicleProto.GetAllModelsRequest
  ): Promise<VehicleProto.GetAllModelsResponse> {
    return lastValueFrom(this.vehicleService.getAllModels(data));
  }

  //================= Brands =================//
  getAllBrands(
    data: VehicleProto.GetAllBrandsRequest
  ): Promise<VehicleProto.GetAllBrandsResponse> {
    return lastValueFrom(this.vehicleService.getAllBrands(data));
  }
}
