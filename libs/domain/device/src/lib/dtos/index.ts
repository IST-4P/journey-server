import { createZodDto } from 'nestjs-zod';
import {
  CreateComboRequestSchema,
  CreateDeviceRequestSchema,
  DeleteComboRequestSchema,
  DeleteComboResponseSchema,
  DeleteDeviceRequestSchema,
  DeleteDeviceResponseSchema,
  GetComboRequestSchema,
  GetComboResponseSchema,
  GetDeviceRequestSchema,
  GetDeviceResponseSchema,
  GetManyCombosRequestSchema,
  GetManyCombosResponseSchema,
  GetManyDevicesAdminRequestSchema,
  GetManyDevicesAdminResponseSchema,
  GetManyDevicesRequestSchema,
  GetManyDevicesResponseSchema,
  UpdateComboRequestSchema,
  UpdateDeviceRequestSchema,
} from '../models';

// Device DTOs
export class GetDeviceRequestDTO extends createZodDto(GetDeviceRequestSchema) {}
export class GetDeviceResponseDTO extends createZodDto(
  GetDeviceResponseSchema
) {}
export class GetManyDevicesRequestDTO extends createZodDto(
  GetManyDevicesRequestSchema
) {}
export class GetManyDevicesResponseDTO extends createZodDto(
  GetManyDevicesResponseSchema
) {}
export class GetManyDevicesAdminRequestDTO extends createZodDto(
  GetManyDevicesAdminRequestSchema
) {}
export class GetManyDevicesAdminResponseDTO extends createZodDto(
  GetManyDevicesAdminResponseSchema
) {}
export class CreateDeviceRequestDTO extends createZodDto(
  CreateDeviceRequestSchema
) {}
export class UpdateDeviceRequestDTO extends createZodDto(
  UpdateDeviceRequestSchema
) {}
export class DeleteDeviceRequestDTO extends createZodDto(
  DeleteDeviceRequestSchema
) {}
export class DeleteDeviceResponseDTO extends createZodDto(
  DeleteDeviceResponseSchema
) {}

// Combo DTOs
export class GetComboRequestDTO extends createZodDto(GetComboRequestSchema) {}
export class GetComboResponseDTO extends createZodDto(GetComboResponseSchema) {}
export class GetManyCombosRequestDTO extends createZodDto(
  GetManyCombosRequestSchema
) {}
export class GetManyCombosResponseDTO extends createZodDto(
  GetManyCombosResponseSchema
) {}
export class CreateComboRequestDTO extends createZodDto(
  CreateComboRequestSchema
) {}
export class UpdateComboRequestDTO extends createZodDto(
  UpdateComboRequestSchema
) {}
export class DeleteComboRequestDTO extends createZodDto(
  DeleteComboRequestSchema
) {}
export class DeleteComboResponseDTO extends createZodDto(
  DeleteComboResponseSchema
) {}
