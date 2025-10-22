import { Module } from '@nestjs/common';
import { FeatureGrpcController } from './feature-grpc.controller';
import { FeatureRepository } from './feature.repo';
import { FeatureService } from './feature.service';

@Module({
  imports: [],
  providers: [FeatureService, FeatureRepository],
  controllers: [FeatureGrpcController],
})
export class FeatureModule {}
