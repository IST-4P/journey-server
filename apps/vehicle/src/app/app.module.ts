import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './brand/brand.module';
import { FeatureModule } from './feature/feature.module';
import { ModelModule } from './model/model.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FeatureModule,
    BrandModule,
    ModelModule,
    VehicleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
