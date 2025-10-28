import { createZodDto } from 'nestjs-zod';
import {
  CreateExtensionRequestSchema,
  GetExtensionRequestSchema,
  GetExtensionResponseSchema,
  GetManyExtensionsRequestSchema,
  GetManyExtensionsResponseSchema,
  UpdateExtensionRequestSchema,
} from '../models';

export class GetManyExtensionsRequestDTO extends createZodDto(
  GetManyExtensionsRequestSchema
) {}
export class GetManyExtensionsResponseDTO extends createZodDto(
  GetManyExtensionsResponseSchema
) {}
export class GetExtensionRequestDTO extends createZodDto(
  GetExtensionRequestSchema
) {}
export class GetExtensionResponseDTO extends createZodDto(
  GetExtensionResponseSchema
) {}
export class CreateExtensionRequestDTO extends createZodDto(
  CreateExtensionRequestSchema
) {}
export class UpdateExtensionRequestDTO extends createZodDto(
  UpdateExtensionRequestSchema
) {}
