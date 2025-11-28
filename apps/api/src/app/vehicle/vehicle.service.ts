import { ReviewProto, VehicleProto } from '@hacmieu-journey/grpc';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VehicleService implements OnModuleInit {
  private readonly logger = new Logger(VehicleService.name);
  private vehicleService!: VehicleProto.VehicleServiceClient;
  private reviewService!: ReviewProto.ReviewServiceClient;

  constructor(
    @Inject(VehicleProto.VEHICLE_PACKAGE_NAME)
    private client: ClientGrpc,
    @Inject(ReviewProto.REVIEW_PACKAGE_NAME)
    private reviewClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.vehicleService =
      this.client.getService<VehicleProto.VehicleServiceClient>(
        VehicleProto.VEHICLE_SERVICE_NAME
      );
    this.reviewService =
      this.reviewClient.getService<ReviewProto.ReviewServiceClient>(
        ReviewProto.REVIEW_SERVICE_NAME
      );
  }

  //================= Vehicles =================//

  getManyVehicles(
    data: VehicleProto.GetManyVehiclesRequest
  ): Promise<VehicleProto.GetManyVehiclesResponse> {
    return lastValueFrom(this.vehicleService.getManyVehicles(data));
  }

  async getVehicle(data: VehicleProto.GetVehicleRequest) {
    const vehicle = await lastValueFrom(this.vehicleService.getVehicle(data));
    if (!vehicle) {
      throw new NotFoundException('Error.VehicleNotFound');
    }
    const reviews = await lastValueFrom(
      this.reviewService.getReviewsByVehicle({
        vehicleId: vehicle.id,
        page: 1,
        limit: 10,
      })
    );
    return {
      ...vehicle,
      reviews: reviews.reviews,
    };
  }

  calculateVehiclePrice(
    data: VehicleProto.CalculateVehiclePriceRequest
  ): Promise<VehicleProto.CalculateVehiclePriceResponse> {
    return lastValueFrom(this.vehicleService.calculateVehiclePrice(data));
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
