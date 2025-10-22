import {
  CreateVehicleRequest,
  DeleteVehicleRequest,
  GetManyVehiclesRequest,
  GetVehicleRequest,
  UpdateVehicleRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import {
  VehicleAlreadyExistsException,
  VehicleNotFoundException,
} from './vehicle.error';
import { VehicleRepository } from './vehicle.repo';

@Injectable()
export class VehicleService {
  // private readonly logger = new Logger(VehicleService.name);

  constructor(private readonly vehicleRepo: VehicleRepository) {}

  async getManyVehicles(data: GetManyVehiclesRequest) {
    const vehicles = await this.vehicleRepo.getManyVehicles(data);
    if (vehicles.vehicles.length === 0) {
      throw VehicleNotFoundException;
    }
    return vehicles;
  }

  async getVehicleById(data: GetVehicleRequest) {
    const vehicle = await this.vehicleRepo.getVehicle(data);
    if (!vehicle) {
      throw VehicleNotFoundException;
    }
    return vehicle;
  }

  async createVehicle(data: CreateVehicleRequest) {
    const vehicle = await this.vehicleRepo.getVehicle({
      licensePlate: data.licensePlate,
    });
    if (vehicle) {
      throw VehicleAlreadyExistsException;
    }
    return this.vehicleRepo.createVehicle(data);
  }

  async updateVehicle(data: UpdateVehicleRequest) {
    const result = await this.vehicleRepo.getVehicle({
      licensePlate: data.licensePlate,
    });
    if (!result) {
      throw VehicleNotFoundException;
    }
    return this.vehicleRepo.updateVehicle(data);
  }

  async deleteVehicle(data: DeleteVehicleRequest) {
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
