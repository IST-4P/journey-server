import { Module } from '@nestjs/common';
import { ModelGrpcController } from './model-grpc.controller';
import { ModelRepository } from './model.repo';
import { ModelService } from './model.service';

@Module({
  imports: [],
  providers: [ModelService, ModelRepository],
  controllers: [ModelGrpcController],
})
export class ModelModule {}
