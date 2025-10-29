import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreateExtensionRequestSchema,
  GetExtensionRequestSchema,
  GetExtensionResponseSchema,
  GetManyExtensionsRequestSchema,
  GetManyExtensionsResponseSchema,
  UpdateExtensionRequestSchema,
  UpdateStatusExtensionRequestSchema,
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
export class UpdateStatusExtensionRequestDTO extends createZodDto(
  UpdateStatusExtensionRequestSchema.extend({
    rejectionReason: z.string().optional(),
  })
) {}
export class UpdateExtensionRequestDTO extends createZodDto(
  UpdateExtensionRequestSchema.extend({
    notes: z.string().optional(),
  })
) {}
