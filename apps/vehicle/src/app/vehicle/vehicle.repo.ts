import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVehicleRequestType,
  DeleteVehicleRequestType,
  GetManyVehiclesRequestType,
  GetVehicleRequestType,
  UpdateVehicleRequestType,
} from './vehicle.model';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  getVehicle(data: GetVehicleRequestType) {
    return this.prisma.vehicle.findMany({
      where: { id: data.id },
    });
  }

  async getManyVehicles({ page, limit, ...where }: GetManyVehiclesRequestType) {
    const skip = (page - 1) * limit;
    const take = limit;
    const [totalItems, vehicles] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.findMany({
        where,
        skip,
        take,
      }),
    ]);

    return {
      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,
        averageRating: vehicle.averageRating?.toNumber() ?? 0,
        latitude: vehicle.latitude.toNumber(),
        longitude: vehicle.longitude.toNumber(),
      })),
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async createVehicle(data: CreateVehicleRequestType) {
    const vehicle = await this.prisma.vehicle.create({
      data,
    });
    return {
      ...vehicle,
      averageRating: vehicle.averageRating?.toNumber() ?? 0,
      latitude: vehicle.latitude.toNumber(),
      longitude: vehicle.longitude.toNumber(),
    };
  }

  async updateVehicle({ id, ...data }: UpdateVehicleRequestType) {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data,
    });
    return {
      ...vehicle,
      averageRating: vehicle.averageRating?.toNumber() ?? 0,
      latitude: vehicle.latitude.toNumber(),
      longitude: vehicle.longitude.toNumber(),
    };
  }

  deleteVehicle(data: DeleteVehicleRequestType) {
    return this.prisma.vehicle.delete({
      where: { id: data.id },
    });
  }
}
