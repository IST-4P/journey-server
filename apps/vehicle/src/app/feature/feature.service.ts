import { Injectable } from '@nestjs/common';
import { FeatureNotFoundException } from './feature.error';
import {
  CreateFeatureRequestType,
  DeleteFeatureRequestType,
  UpdateFeatureRequestType,
} from './feature.model';
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

  createFeature(data: CreateFeatureRequestType) {
    return this.featureRepo.createFeature(data);
  }

  async updateFeature(data: UpdateFeatureRequestType) {
    const result = await this.featureRepo.getFeatureById(data);
    if (!result) {
      throw FeatureNotFoundException;
    }
    return this.featureRepo.updateFeature(data);
  }

  async deleteFeature(data: DeleteFeatureRequestType) {
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
