import { NatsModule } from '@hacmieu-journey/nats';
import { Module } from '@nestjs/common';
import { ProfileGrpcController } from './profile-grpc.controller';
import { ProfileConsumer } from './profile.consumer';
import { ProfileRepository } from './profile.repo';
import { ProfileService } from './profile.service';

@Module({
  imports: [NatsModule],
  providers: [ProfileService, ProfileConsumer, ProfileRepository],
  controllers: [ProfileGrpcController],
})
export class ProfileModule {}
