import {
  CreateComboRequestDTO,
  CreateDeviceRequestDTO,
  DeleteComboRequestDTO,
  DeleteDeviceRequestDTO,
  GetComboRequestDTO,
  GetDeviceRequestDTO,
  GetManyCombosRequestDTO,
  GetManyDevicesRequestDTO,
  UpdateComboRequestDTO,
  UpdateDeviceRequestDTO,
} from '@domain/device';
import { IsPublic } from '@hacmieu-journey/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('device')
export class DeviceController {
  // private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @IsPublic()
  getManyDevices(@Query() query: GetManyDevicesRequestDTO) {
    return this.deviceService.getManyDevicesAdmin(query);
  }

  @Get(':id')
  getDevice(@Param() query: GetDeviceRequestDTO) {
    return this.deviceService.getDevice(query);
  }

  @Post()
  @IsPublic()
  createDevice(@Body() body: CreateDeviceRequestDTO) {
    return this.deviceService.createDevice(body);
  }

  @Put()
  updateDevice(@Body() body: UpdateDeviceRequestDTO) {
    return this.deviceService.updateDevice(body);
  }

  @Delete(':deviceId')
  deleteDevice(@Param() params: DeleteDeviceRequestDTO) {
    return this.deviceService.deleteDevice(params);
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

  @Get(':comboId')
  @IsPublic()
  getCombo(@Param() query: GetComboRequestDTO) {
    return this.deviceService.getCombo(query);
  }

  @Post()
  @IsPublic()
  createCombo(@Body() body: CreateComboRequestDTO) {
    return this.deviceService.createCombo(body);
  }

  @Put()
  updateCombo(@Body() body: UpdateComboRequestDTO) {
    return this.deviceService.updateCombo(body);
  }

  @Delete(':comboId')
  deleteCombo(@Param() params: DeleteComboRequestDTO) {
    return this.deviceService.deleteCombo(params);
  }
}
