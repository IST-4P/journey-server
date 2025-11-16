import {
  CreateBrandRequest,
  DeleteBrandRequest,
  GetAllBrandsRequest,
  UpdateBrandRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import {
  BrandAlreadyExistsException,
  BrandNotFoundException,
} from './brand.error';
import { BrandRepository } from './brand.repo';
@Injectable()
export class BrandService {
  // private readonly logger = new Logger(BrandService.name);

  constructor(private readonly brandRepo: BrandRepository) {}

  async getAllBrands(data: GetAllBrandsRequest) {
    const brands = await this.brandRepo.getAllBrands(data);
    if (brands.length == 0) {
      throw BrandNotFoundException;
    }
    return { brands };
  }

  async createBrand(data: CreateBrandRequest) {
    const brand = await this.brandRepo.getBrandByName({ name: data.name });
    if (brand) {
      throw BrandAlreadyExistsException;
    }
    return this.brandRepo.createBrand(data);
  }

  async updateBrand(data: UpdateBrandRequest) {
    const result = await this.brandRepo.getBrandByName({ id: data.id });
    if (!result) {
      throw BrandNotFoundException;
    }
    return this.brandRepo.updateBrand(data);
  }

  async deleteBrand(data: DeleteBrandRequest) {
    const result = await this.brandRepo.getBrandByName({ id: data.id });
    if (!result) {
      throw BrandNotFoundException;
    }
    await this.brandRepo.deleteBrand(data);
    return {
      message: 'Message.DeleteBrandSuccessfully',
    };
  }
}
