import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFeatureRequestType,
  DeleteFeatureRequestType,
  GetFeatureRequestType,
  UpdateFeatureRequestType,
} from './feature.model';

@Injectable()
export class FeatureRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllFeatures() {
    return this.prisma.vehicleFeature.findMany();
  }

  getFeatureById(data: GetFeatureRequestType) {
    return this.prisma.vehicleFeature.findUnique({
      where: { id: data.id },
    });
  }

  createFeature(data: CreateFeatureRequestType) {
    return this.prisma.vehicleFeature.create({
      data,
    });
  }

  updateFeature({ id, ...data }: UpdateFeatureRequestType) {
    return this.prisma.vehicleFeature.update({
      where: { id },
      data,
    });
  }

  deleteFeature(data: DeleteFeatureRequestType) {
    return this.prisma.vehicleFeature.delete({
      where: { id: data.id },
    });
  }
}
