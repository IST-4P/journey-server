import {
  GetComboRequestDTO,
  GetDeviceRequestDTO,
  GetManyCombosRequestDTO,
  GetManyDevicesRequestDTO,
} from '@domain/device';
import { IsPublic } from '@hacmieu-journey/nestjs';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('device')
export class DeviceController {
  // private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @IsPublic()
  getManyDevices(@Query() query: GetManyDevicesRequestDTO) {
    return this.deviceService.getManyDevices(query);
  }

  @Get(':id')
  @IsPublic()
  getDevice(@Param() query: GetDeviceRequestDTO) {
    return this.deviceService.getDevice(query);
  }
}

@Controller('combo')
export class ComboController {
  // private readonly logger = new Logger(ComboController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @IsPublic()
  getManyCombo(@Query() query: GetManyCombosRequestDTO) {
    return this.deviceService.getManyCombos(query);
  }

  @Get(':id')
  @IsPublic()
  getCombo(@Param() query: GetComboRequestDTO) {
    return this.deviceService.getCombo(query);
  }
}
