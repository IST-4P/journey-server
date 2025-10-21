import {
  CreateFeatureRequest,
  DeleteFeatureRequest,
  GetFeatureRequest,
  UpdateFeatureRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import {
  FeatureAlreadyExistsException,
  FeatureNotFoundException,
} from './feature.error';
import { FeatureRepository } from './feature.repo';
@Injectable()
export class FeatureService {
  // private readonly logger = new Logger(FeatureService.name);

  constructor(private readonly featureRepo: FeatureRepository) {}

  async getAllFeatures() {
    const features = await this.featureRepo.getAllFeatures();
    if (features.length == 0) {
      throw FeatureNotFoundException;
    }
    return { features };
  }

  async getFeature(data: GetFeatureRequest) {
    const feature = await this.featureRepo.getFeatureById(data);
    if (!feature) {
      throw FeatureNotFoundException;
    }
    return feature;
  }

  async createFeature(data: CreateFeatureRequest) {
    const feature = await this.featureRepo.getFeatureById({ name: data.name });
    if (feature) {
      throw FeatureAlreadyExistsException;
    }
    return this.featureRepo.createFeature(data);
  }

  async updateFeature(data: UpdateFeatureRequest) {
    const result = await this.featureRepo.getFeatureById(data);
    if (!result) {
      throw FeatureNotFoundException;
    }
    return this.featureRepo.updateFeature(data);
  }

  async deleteFeature(data: DeleteFeatureRequest) {
    const result = await this.featureRepo.getFeatureById(data);
    if (!result) {
      throw FeatureNotFoundException;
    }
    await this.featureRepo.deleteFeature(data);
    return {
      message: 'Message.DeleteFeatureSuccessfully',
    };
  }
}
