import { VehicleProto } from '@hacmieu-journey/grpc';
import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  BrandController,
  FeatureController,
  ModelController,
  VehicleController,
} from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    NatsModule,
    ClientsModule.registerAsync([
      {
        name: VehicleProto.VEHICLE_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url:
              configService.getOrThrow('VEHICLE_GRPC_SERVICE_URL') ||
              'localhost:5004',
            package: VehicleProto.VEHICLE_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/vehicle.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    VehicleController,
    FeatureController,
    BrandController,
    ModelController,
  ],
  providers: [
    VehicleService,
    {
      provide: 'VEHICLE_SERVICE',
      useExisting: VehicleService,
    },
  ],
})
export class VehicleModule {}
