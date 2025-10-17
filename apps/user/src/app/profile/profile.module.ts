import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { ProfileGrpcController } from './profile-grpc.controller';
import { ProfileConsumer } from './profile.consumer';
import { ProfileRepository } from './profile.repo';
import { ProfileService } from './profile.service';

@Module({
  imports: [PulsarModule],
  providers: [ProfileService, ProfileConsumer, ProfileRepository],
  controllers: [ProfileGrpcController],
})
export class ProfileModule {}
