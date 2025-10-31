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

  getManyDevicesAdmin(
    data: DeviceProto.GetManyDevicesRequest
  ): Promise<DeviceProto.GetManyDevicesAdminResponse> {
    return lastValueFrom(this.deviceService.getManyDevicesAdmin(data));
  }

  createDevice(
    data: DeviceProto.CreateDeviceRequest
  ): Promise<DeviceProto.GetDeviceResponse> {
    return lastValueFrom(this.deviceService.createDevice(data));
  }

  updateDevice(
    data: DeviceProto.UpdateDeviceRequest
  ): Promise<DeviceProto.GetDeviceResponse> {
    return lastValueFrom(this.deviceService.updateDevice(data));
  }

  deleteDevice(
    data: DeviceProto.DeleteDeviceRequest
  ): Promise<DeviceProto.DeleteDeviceResponse> {
    return lastValueFrom(this.deviceService.deleteDevice(data));
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

  createCombo(
    data: DeviceProto.CreateComboRequest
  ): Promise<DeviceProto.GetComboResponse> {
    return lastValueFrom(this.deviceService.createCombo(data));
  }

  updateCombo(
    data: DeviceProto.UpdateComboRequest
  ): Promise<DeviceProto.GetComboResponse> {
    return lastValueFrom(this.deviceService.updateCombo(data));
  }

  deleteCombo(
    data: DeviceProto.DeleteComboRequest
  ): Promise<DeviceProto.DeleteComboResponse> {
    return lastValueFrom(this.deviceService.deleteCombo(data));
  }
}
