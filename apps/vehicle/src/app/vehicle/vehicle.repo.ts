import {
  CalculateVehiclePriceRequest,
  CreateVehicleRequest,
  DeleteVehicleRequest,
  GetManyVehiclesRequest,
  GetVehicleRequest,
  UpdateVehicleRequest,
  VehicleStatus,
} from '@domain/vehicle';
import { calculateVehiclePrice } from '@hacmieu-journey/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma-clients/vehicle';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleNotFoundException } from './vehicle.error';

@Injectable()
export class VehicleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

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

  async getManyVehicles({ page, limit, ...query }: GetManyVehiclesRequest) {
    const skip = (page - 1) * limit;
    const take = limit;

    let where: Prisma.VehicleWhereInput = {};
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.licensePlate) {
      where.licensePlate = {
        contains: query.licensePlate,
        mode: 'insensitive',
      };
    }
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.ward) {
      where.ward = {
        contains: query.ward,
        mode: 'insensitive',
      };
    }

    const [totalItems, vehicles] = await Promise.all([
      this.prisma.vehicle.count({
        where: {
          ...query,
          ...where,
        },
      }),
      this.prisma.vehicle.findMany({
        where: {
          ...query,
          ...where,
        },
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

  async calculatePrice(data: CalculateVehiclePriceRequest) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw VehicleNotFoundException;
    }

    const vehicleFeeDay = vehicle.pricePerDay;
    const vehicleFeeHour = vehicle.pricePerHour;

    const vatPercent =
      this.configService.getOrThrow<number>('BOOKING_VAT') || 0;

    const deposit =
      this.configService.getOrThrow<number>('BOOKING_DEPOSIT') || 0;

    const insuranceFeePercent =
      this.configService.getOrThrow<number>('BOOKING_INSURANCE_FEE') || 0;

    const allPrices = calculateVehiclePrice({
      vehicleFeeDay,
      vehicleFeeHour,
      insuranceFeePercent,
      vatPercent,
      deposit,
      hours: data.hours,
    });

    return {
      rentalFee: allPrices.rentalFee,
      insuranceFee: allPrices.insuranceFee,
      totalAmount: allPrices.totalAmount,
      vat: allPrices.vat,
      deposit,
    };
  }

  async updateStatus(data: { id: string; status: VehicleStatus }) {
    console.log(JSON.stringify(data));
    await this.prisma.vehicle.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });
  }
}
