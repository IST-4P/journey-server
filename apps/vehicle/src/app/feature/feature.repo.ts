import {
  CreateFeatureRequest,
  DeleteFeatureRequest,
  GetFeatureRequest,
  UpdateFeatureRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllFeatures() {
    return this.prisma.vehicleFeature.findMany();
  }

  getFeatureById(data: GetFeatureRequest) {
    return this.prisma.vehicleFeature.findUnique({
      where: { id: data.id },
    });
  }

  createFeature(data: CreateFeatureRequest) {
    return this.prisma.vehicleFeature.create({
      data,
    });
  }

  updateFeature({ id, ...data }: UpdateFeatureRequest) {
    return this.prisma.vehicleFeature.update({
      where: { id },
      data,
    });
  }

  deleteFeature(data: DeleteFeatureRequest) {
    return this.prisma.vehicleFeature.delete({
      where: { id: data.id },
    });
  }
}
