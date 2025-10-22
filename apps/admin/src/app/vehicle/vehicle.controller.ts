import {
  CreateBrandRequestDTO,
  CreateFeatureRequestDTO,
  CreateModelRequestDTO,
  CreateVehicleRequestDTO,
  DeleteBrandRequestDTO,
  DeleteModelRequestDTO,
  GetFeatureRequestDTO,
  GetManyVehiclesRequestDTO,
  GetVehicleRequestDTO,
  UpdateBrandRequestDTO,
  UpdateFeatureRequestDTO,
  UpdateModelRequestDTO,
  UpdateVehicleRequestDTO,
} from '@domain/vehicle';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle-feature')
export class FeatureController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  getAllFeatures() {
    return this.vehicleService.getAllFeatures({});
  }

  @Get(':id')
  getFeature(@Param() params: GetFeatureRequestDTO) {
    return this.vehicleService.getFeature(params);
  }

  @Post()
  createFeature(@Body() body: CreateFeatureRequestDTO) {
    return this.vehicleService.createFeature(body);
  }

  @Put(':id')
  updateFeature(
    @Body() body: UpdateFeatureRequestDTO,
    @Param('id') id: string
  ) {
    return this.vehicleService.updateFeature({ ...body, id });
  }

  @Delete(':id')
  deleteFeature(@Param() params: GetFeatureRequestDTO) {
    return this.vehicleService.deleteFeature(params);
  }
}

@Controller('vehicle-brand')
export class BrandController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  getAllBrands() {
    return this.vehicleService.getAllBrands({});
  }

  @Post()
  createBrand(@Body() body: CreateBrandRequestDTO) {
    return this.vehicleService.createBrand(body);
  }

  @Put(':id')
  updateBrand(@Body() body: UpdateBrandRequestDTO, @Param('id') id: string) {
    return this.vehicleService.updateBrand({ ...body, id });
  }

  @Delete(':id')
  deleteBrand(@Param() params: DeleteBrandRequestDTO) {
    return this.vehicleService.deleteBrand(params);
  }
}

@Controller('vehicle-model')
export class ModelController {
  constructor(private readonly vehicleService: VehicleService) {}
  @Get()
  getAllModels() {
    return this.vehicleService.getAllModels({});
  }

  @Post()
  createModel(@Body() body: CreateModelRequestDTO) {
    return this.vehicleService.createModel(body);
  }

  @Put(':id')
  updateModel(@Body() body: UpdateModelRequestDTO, @Param('id') id: string) {
    return this.vehicleService.updateModel({ ...body, id });
  }

  @Delete(':id')
  deleteModel(@Param() params: DeleteModelRequestDTO) {
    return this.vehicleService.deleteModel(params);
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

  @Post()
  createVehicle(@Body() body: CreateVehicleRequestDTO) {
    return this.vehicleService.createVehicle(body);
  }

  @Put(':id')
  updateVehicle(
    @Body() body: UpdateVehicleRequestDTO,
    @Param('id') id: string
  ) {
    return this.vehicleService.updateVehicle({ ...body, id });
  }

  @Delete(':id')
  deleteVehicle(@Param() params: GetVehicleRequestDTO) {
    return this.vehicleService.deleteVehicle(params);
  }
}
