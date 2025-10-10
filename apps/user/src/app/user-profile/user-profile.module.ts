import { PulsarModule } from '@hacmieu-journey/pulsar';
import { Module } from '@nestjs/common';
import { UserProfileConsumer } from './user-profile.consumer';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [PulsarModule],
  providers: [UserProfileService, UserProfileConsumer],
  exports: [UserProfileService],
})
export class UserProfileModule {}
