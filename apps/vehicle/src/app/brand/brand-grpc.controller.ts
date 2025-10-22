import { MessageResponse } from '@domain/shared';
import {
  CreateBrandRequest,
  DeleteBrandRequest,
  GetAllBrandsResponse,
  GetBrandResponse,
  UpdateBrandRequest,
} from '@domain/vehicle';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BrandService } from './brand.service';

@Controller()
export class BrandGrpcController {
  constructor(private readonly brandService: BrandService) {}

  @GrpcMethod('VehicleService', 'GetAllBrands')
  getAllBrands(): Promise<GetAllBrandsResponse> {
    return this.brandService.getAllBrands();
  }

  @GrpcMethod('VehicleService', 'CreateBrand')
  createBrand(data: CreateBrandRequest): Promise<GetBrandResponse> {
    return this.brandService.createBrand(data);
  }

  @GrpcMethod('VehicleService', 'UpdateBrand')
  updateBrand(data: UpdateBrandRequest): Promise<GetBrandResponse> {
    return this.brandService.updateBrand(data);
  }

  @GrpcMethod('VehicleService', 'DeleteBrand')
  deleteBrand(data: DeleteBrandRequest): Promise<MessageResponse> {
    return this.brandService.deleteBrand(data);
  }
}
