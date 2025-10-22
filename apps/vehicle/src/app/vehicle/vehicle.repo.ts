import {
  CreateVehicleRequest,
  DeleteVehicleRequest,
  GetManyVehiclesRequest,
  GetVehicleRequest,
  UpdateVehicleRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getVehicle(data: GetVehicleRequest) {
    return this.prisma.vehicle
      .findFirst({
        where: {
          OR: [{ id: data.id }, { licensePlate: data.licensePlate }],
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

  async getManyVehicles({ page, limit, ...where }: GetManyVehiclesRequest) {
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

  async createVehicle({ featureIds, ...data }: CreateVehicleRequest) {
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

  async updateVehicle({ id, featureIds, ...data }: UpdateVehicleRequest) {
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

  deleteVehicle(data: DeleteVehicleRequest) {
    return this.prisma.vehicle.delete({
      where: { id: data.id },
    });
  }
}
