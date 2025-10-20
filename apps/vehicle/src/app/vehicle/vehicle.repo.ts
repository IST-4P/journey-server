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
    return this.prisma.vehicle
      .findUnique({
        where: { id: data.id },
        include: {
          vehicleFeatures: {
            select: {
              feature: {
                select: {
                  name: true,
                  icon: true,
                  description: true,
                },
              },
            },
          },
        },
      })
      .then((vehicle) => {
        if (!vehicle) return null;

        return {
          ...vehicle,
          averageRating: vehicle.averageRating?.toNumber() ?? 0,
          latitude: vehicle.latitude.toNumber(),
          longitude: vehicle.longitude.toNumber(),
        };
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

  async createVehicle({ featureIds, ...data }: CreateVehicleRequestType) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...data,
        vehicleFeatures: featureIds
          ? {
              create: featureIds.map((featureId) => ({
                featureId,
              })),
            }
          : undefined,
      },
      include: {
        vehicleFeatures: {
          select: {
            feature: {
              select: {
                name: true,
                icon: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return {
      ...vehicle,
      averageRating: vehicle.averageRating?.toNumber() ?? 0,
      latitude: vehicle.latitude.toNumber(),
      longitude: vehicle.longitude.toNumber(),
    };
  }

  async updateVehicle({ id, featureIds, ...data }: UpdateVehicleRequestType) {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        ...(featureIds !== undefined && {
          vehicleFeatures: {
            deleteMany: {},
            create: featureIds.map((featureId) => ({
              featureId,
            })),
          },
        }),
      },
      include: {
        vehicleFeatures: {
          select: {
            feature: {
              select: {
                name: true,
                icon: true,
                description: true,
              },
            },
          },
        },
      },
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
