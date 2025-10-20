import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeatureModule } from './feature/feature.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FeatureModule,
    VehicleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
