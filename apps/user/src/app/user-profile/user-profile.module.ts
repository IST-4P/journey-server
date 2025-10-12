import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { UserProfileGrpcController } from './user-profile-grpc.controller';
import { UserProfileConsumer } from './user-profile.consumer';
import { UserProfileRepository } from './user-profile.repo';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [PulsarModule],
  providers: [UserProfileService, UserProfileConsumer, UserProfileRepository],
  controllers: [UserProfileGrpcController],
})
export class UserProfileModule {}
