import { createZodDto } from 'nestjs-zod';
import {
  CancelRentalRequestSchema,
  CancelRentalResponseSchema,
  CreateRentalExtensionRequestSchema,
  CreateRentalRequestSchema,
  DeleteRentalRequestSchema,
  DeleteRentalResponseSchema,
  GetAllRentalsAdminResponseSchema,
  GetAllRentalsRequestSchema,
  GetMyRentalsRequestSchema,
  GetMyRentalsResponseSchema,
  GetRentalByIdRequestSchema,
  GetRentalExtensionsRequestSchema,
  GetRentalExtensionsResponseSchema,
  RentalResponseSchema,
  UpdateRentalRequestSchema,
} from '../models';

// Rental DTOs
export class CreateRentalRequestDTO extends createZodDto(
  CreateRentalRequestSchema
) {}
export class RentalResponseDTO extends createZodDto(RentalResponseSchema) {}
export class GetMyRentalsRequestDTO extends createZodDto(
  GetMyRentalsRequestSchema
) {}
export class GetMyRentalsResponseDTO extends createZodDto(
  GetMyRentalsResponseSchema
) {}
export class GetRentalByIdRequestDTO extends createZodDto(
  GetRentalByIdRequestSchema
) {}
export class GetAllRentalsRequestDTO extends createZodDto(
  GetAllRentalsRequestSchema
) {}
export class GetAllRentalsAdminResponseDTO extends createZodDto(
  GetAllRentalsAdminResponseSchema
) {}
export class CancelRentalRequestDTO extends createZodDto(
  CancelRentalRequestSchema
) {}
export class CancelRentalResponseDTO extends createZodDto(
  CancelRentalResponseSchema
) {}
export class UpdateRentalRequestDTO extends createZodDto(
  UpdateRentalRequestSchema
) {}
export class DeleteRentalRequestDTO extends createZodDto(
  DeleteRentalRequestSchema
) {}
export class DeleteRentalResponseDTO extends createZodDto(
  DeleteRentalResponseSchema
) {}

// Rental Extension DTOs
export class CreateRentalExtensionRequestDTO extends createZodDto(
  CreateRentalExtensionRequestSchema
) {}
export class GetRentalExtensionsRequestDTO extends createZodDto(
  GetRentalExtensionsRequestSchema
) {}
export class GetRentalExtensionsResponseDTO extends createZodDto(
  GetRentalExtensionsResponseSchema
) {}
