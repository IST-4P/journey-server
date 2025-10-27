import {
  GetAllModelsRequestDTO,
  GetManyVehiclesRequestDTO,
  GetVehicleRequestDTO,
} from '@domain/vehicle';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle-feature')
export class FeatureController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  getAllFeatures() {
    return this.vehicleService.getAllFeatures({});
  }
}

@Controller('vehicle-brand')
export class BrandController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  getAllBrands() {
    return this.vehicleService.getAllBrands({});
  }
}

@Controller('vehicle-model')
export class ModelController {
  constructor(private readonly vehicleService: VehicleService) {}
  @Get()
  getAllModels(@Query() query: GetAllModelsRequestDTO) {
    return this.vehicleService.getAllModels(query);
  }
}

@Controller('vehicle')
export class VehicleController {
  // private readonly logger = new Logger(VehicleController.name);
  constructor(private readonly vehicleService: VehicleService) {}
  @Get()
  getManyVehicles(@Query() query: GetManyVehiclesRequestDTO) {
    return this.vehicleService.getManyVehicles(query);
  }

  @Get(':id')
  getVehicle(@Param() params: GetVehicleRequestDTO) {
    return this.vehicleService.getVehicle(params);
  }
}
