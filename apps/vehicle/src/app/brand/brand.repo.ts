import {
  CreateBrandRequest,
  DeleteBrandRequest,
  GetAllBrandsRequest,
  GetBrandRequest,
  UpdateBrandRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAllBrands(data: GetAllBrandsRequest) {
    return this.prisma.vehicleBrand.findMany({
      where: data,
    });
  }

  getBrandByName(data: GetBrandRequest) {
    return this.prisma.vehicleBrand.findFirst({
      where: {
        OR: [{ id: data.id }, { name: data.name }],
      },
    });
  }

  createBrand(data: CreateBrandRequest) {
    return this.prisma.vehicleBrand.create({
      data,
    });
  }

  updateBrand({ id, ...data }: UpdateBrandRequest) {
    return this.prisma.vehicleBrand.update({
      where: { id },
      data,
    });
  }

  deleteBrand(data: DeleteBrandRequest) {
    return this.prisma.vehicleBrand.delete({
      where: { id: data.id },
    });
  }
}
