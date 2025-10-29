import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ExtensionGrpcController } from './extension-grpc.controller';
import { ExtensionRepository } from './extension.repo';
import { ExtensionService } from './extension.service';

@Module({
  imports: [NatsModule],
  controllers: [ExtensionGrpcController],
  providers: [ExtensionService, ExtensionRepository],
})
export class ExtensionModule {}
