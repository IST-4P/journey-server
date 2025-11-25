import { Auth, AuthType } from '@hacmieu-journey/nestjs';
import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  // private readonly logger = new Logger(SystemController.name);

  constructor(private readonly systemService: SystemService) {}

  @Get('dashboard')
  @Auth([AuthType.Admin])
  dashboard() {
    return this.systemService.dashboard();
  }
}
