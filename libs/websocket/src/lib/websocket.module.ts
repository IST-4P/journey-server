import { AuthGuardModule } from '@hacmieu-journey/nestjs';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [AuthGuardModule],
})
export class WebSocketModule {}
