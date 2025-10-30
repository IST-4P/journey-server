import { DeviceProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DeviceService implements OnModuleInit {
  private deviceService!: DeviceProto.DeviceServiceClient;

  constructor(
    @Inject(DeviceProto.DEVICE_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.deviceService =
      this.client.getService<DeviceProto.DeviceServiceClient>(
        DeviceProto.DEVICE_SERVICE_NAME
      );
  }

  getDevice(
    data: DeviceProto.GetDeviceRequest
  ): Promise<DeviceProto.GetDeviceResponse> {
    return lastValueFrom(this.deviceService.getDevice(data));
  }

  getManyDevices(
    data: DeviceProto.GetManyDevicesRequest
  ): Promise<DeviceProto.GetManyDevicesResponse> {
    return lastValueFrom(this.deviceService.getManyDevices(data));
  }

  getCombo(
    data: DeviceProto.GetComboRequest
  ): Promise<DeviceProto.GetComboResponse> {
    return lastValueFrom(this.deviceService.getCombo(data));
  }

  getManyCombos(
    data: DeviceProto.GetManyCombosRequest
  ): Promise<DeviceProto.GetManyCombosResponse> {
    return lastValueFrom(this.deviceService.getManyCombos(data));
  }
}
