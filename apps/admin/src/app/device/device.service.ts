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

  getCategory(
    data: DeviceProto.GetCategoryRequest
  ): Promise<DeviceProto.GetCategoryResponse> {
    return lastValueFrom(this.deviceService.getCategory(data));
  }

  getManyCategories(
    data: DeviceProto.GetManyCategoriesRequest
  ): Promise<DeviceProto.GetManyCategoriesResponse> {
    return lastValueFrom(this.deviceService.getManyCategories(data));
  }

  createCategory(
    data: DeviceProto.CreateCategoryRequest
  ): Promise<DeviceProto.CreateCategoryResponse> {
    return lastValueFrom(this.deviceService.createCategory(data));
  }

  updateCategory(
    data: DeviceProto.UpdateCategoryRequest
  ): Promise<DeviceProto.UpdateCategoryResponse> {
    return lastValueFrom(this.deviceService.updateCategory(data));
  }

  deleteCategory(
    data: DeviceProto.DeleteCategoryRequest
  ): Promise<DeviceProto.DeleteCategoryResponse> {
    return lastValueFrom(this.deviceService.deleteCategory(data));
  }
}
