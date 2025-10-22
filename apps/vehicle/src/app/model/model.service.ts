import {
  CreateModelRequest,
  DeleteModelRequest,
  GetAllModelsRequest,
  UpdateModelRequest,
} from '@domain/vehicle';
import { Injectable } from '@nestjs/common';
import {
  ModelAlreadyExistsException,
  ModelNotFoundException,
} from './model.error';
import { ModelRepository } from './model.repo';
@Injectable()
export class ModelService {
  // private readonly logger = new Logger(ModelService.name);

  constructor(private readonly modelRepo: ModelRepository) {}

  async getAllModels(data: GetAllModelsRequest) {
    const models = await this.modelRepo.getAllModels(data);
    if (models.length == 0) {
      throw ModelNotFoundException;
    }
    return { models };
  }

  async createModel(data: CreateModelRequest) {
    const model = await this.modelRepo.getModel({ name: data.name });
    if (model) {
      throw ModelAlreadyExistsException;
    }
    return this.modelRepo.createModel(data);
  }

  async updateModel(data: UpdateModelRequest) {
    const result = await this.modelRepo.getModel({ id: data.id });
    if (!result) {
      throw ModelNotFoundException;
    }
    return this.modelRepo.updateModel(data);
  }

  async deleteModel(data: DeleteModelRequest) {
    const result = await this.modelRepo.getModel(data);
    if (!result) {
      throw ModelNotFoundException;
    }
    await this.modelRepo.deleteModel(data);
    return {
      message: 'Message.DeleteModelSuccessfully',
    };
  }
}
