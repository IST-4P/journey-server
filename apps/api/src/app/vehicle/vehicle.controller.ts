import {
  CalculateVehiclePriceRequestDTO,
  GetAllModelsRequestDTO,
  GetManyVehiclesRequestDTO,
  GetVehicleRequestDTO,
} from '@domain/vehicle';
import { IsPublic } from '@hacmieu-journey/nestjs';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle-feature')
export class FeatureController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @IsPublic()
  getAllFeatures() {
    return this.vehicleService.getAllFeatures({});
  }
}

@Controller('vehicle-brand')
export class BrandController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @IsPublic()
  getAllBrands() {
    return this.vehicleService.getAllBrands({});
  }
}

@Controller('vehicle-model')
export class ModelController {
  constructor(private readonly vehicleService: VehicleService) {}
  @Get()
  @IsPublic()
  getAllModels(@Query() query: GetAllModelsRequestDTO) {
    return this.vehicleService.getAllModels(query);
  }
}

@Controller('vehicle')
export class VehicleController {
  // private readonly logger = new Logger(VehicleController.name);
  constructor(private readonly vehicleService: VehicleService) {}
  @Get()
  @IsPublic()
  getManyVehicles(@Query() query: GetManyVehiclesRequestDTO) {
    return this.vehicleService.getManyVehicles(query);
  }

  @Get('price')
  @IsPublic()
  calculateVehiclePrice(@Query() query: CalculateVehiclePriceRequestDTO) {
    return this.vehicleService.calculateVehiclePrice(query);
  }

  @Get(':id')
  @IsPublic()
  getVehicle(@Param() params: GetVehicleRequestDTO) {
    return this.vehicleService.getVehicle(params);
  }
}

@Controller('vehicle-price')
export class VehiclePriceController {
  // private readonly logger = new Logger(VehiclePriceController.name);
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @IsPublic()
  calculateVehiclePrice(@Query() query: CalculateVehiclePriceRequestDTO) {
    return this.vehicleService.calculateVehiclePrice(query);
  }
}
