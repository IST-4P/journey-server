import { Module } from '@nestjs/common';
import { BrandGrpcController } from './brand-grpc.controller';
import { BrandRepository } from './brand.repo';
import { BrandService } from './brand.service';

@Module({
  imports: [],
  providers: [BrandService, BrandRepository],
  controllers: [BrandGrpcController],
})
export class BrandModule {}
