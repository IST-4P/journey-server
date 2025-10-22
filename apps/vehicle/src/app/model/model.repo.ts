import {
  CreateModelRequest,
  DeleteModelRequest,
  GetAllModelsRequest,
  GetModelRequest,
  UpdateModelRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModelRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllModels(data: GetAllModelsRequest) {
    return this.prisma.vehicleModel.findMany({
      where: data,
    });
  }

  getModel(data: GetModelRequest) {
    return this.prisma.vehicleModel.findFirst({
      where: data,
    });
  }

  createModel(data: CreateModelRequest) {
    return this.prisma.vehicleModel.create({
      data,
    });
  }

  updateModel({ id, ...data }: UpdateModelRequest) {
    return this.prisma.vehicleModel.update({
      where: { id },
      data,
    });
  }

  deleteModel(data: DeleteModelRequest) {
    return this.prisma.vehicleModel.delete({
      where: { id: data.id },
    });
  }
}
