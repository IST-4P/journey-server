import { Injectable } from '@nestjs/common';
import { VehicleNotFoundException } from './vehicle.error';
import {
  CreateVehicleRequestType,
  DeleteVehicleRequestType,
  GetManyVehiclesRequestType,
  GetVehicleRequestType,
  UpdateVehicleRequestType,
} from './vehicle.model';
import { VehicleRepository } from './vehicle.repo';

@Injectable()
export class VehicleService {
  // private readonly logger = new Logger(VehicleService.name);

  constructor(private readonly vehicleRepo: VehicleRepository) {}

  getManyVehicles(data: GetManyVehiclesRequestType) {
    return this.vehicleRepo.getManyVehicles(data);
  }

  async getVehicleById(data: GetVehicleRequestType) {
    const vehicle = await this.vehicleRepo.getVehicle(data);
    if (!vehicle) {
      throw VehicleNotFoundException;
    }
    return vehicle;
  }

  async createVehicle(data: CreateVehicleRequestType) {
    const vehicle = await this.vehicleRepo.getVehicle({
      licensePlate: data.licensePlate,
    });
    if (vehicle) {
      throw new Error('Vehicle already exists');
    }
    return this.vehicleRepo.createVehicle(data);
  }

  async updateVehicle(data: UpdateVehicleRequestType) {
    const result = await this.vehicleRepo.getVehicle({
      licensePlate: data.licensePlate,
    });
    if (!result) {
      throw VehicleNotFoundException;
    }
    return this.vehicleRepo.updateVehicle(data);
  }

  async deleteVehicle(data: DeleteVehicleRequestType) {
    const result = await this.vehicleRepo.getVehicle(data);
    if (!result) {
      throw VehicleNotFoundException;
    }
    await this.vehicleRepo.deleteVehicle(data);
    return {
      message: 'Message.VehicleDeletedSuccessfully',
    };
  }
}
