import { createZodDto } from 'nestjs-zod';
import {
  CreateVehicleRequestSchema,
  DeleteVehicleRequestSchema,
  GetManyVehiclesRequestSchema,
  GetManyVehiclesResponseSchema,
  GetVehicleRequestSchema,
  GetVehicleResponseSchema,
  UpdateVehicleRequestSchema,
} from '../models';

export class GetVehicleRequestDTO extends createZodDto(
  GetVehicleRequestSchema
) {}

export class GetVehicleResponseDTO extends createZodDto(
  GetVehicleResponseSchema
) {}

export class GetManyVehiclesRequestDTO extends createZodDto(
  GetManyVehiclesRequestSchema
) {}

export class GetManyVehiclesResponseDTO extends createZodDto(
  GetManyVehiclesResponseSchema
) {}

export class CreateVehicleRequestDTO extends createZodDto(
  CreateVehicleRequestSchema
) {}

export class UpdateVehicleRequestDTO extends createZodDto(
  UpdateVehicleRequestSchema
) {}

export class DeleteVehicleRequestDTO extends createZodDto(
  DeleteVehicleRequestSchema
) {}
