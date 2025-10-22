import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreateAddressRequestSchema,
  DeleteAddressRequestSchema,
  GetAddressRequestSchema,
  GetAddressResponseSchema,
  GetManyAddressRequestSchema,
  UpdateAddressRequestSchema,
} from '../models';

export class GetManyAddressRequestDTO extends createZodDto(
  GetManyAddressRequestSchema
) {}
export class GetAddressRequestDTO extends createZodDto(
  GetAddressRequestSchema
) {}
export class GetAddressResponseDTO extends createZodDto(
  GetAddressResponseSchema
) {}
export class CreateAddressRequestDTO extends createZodDto(
  CreateAddressRequestSchema.extend({
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  })
) {}
export class UpdateAddressRequestDTO extends createZodDto(
  UpdateAddressRequestSchema.extend({
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  })
) {}
export class DeleteAddressRequestDTO extends createZodDto(
  DeleteAddressRequestSchema
) {}
