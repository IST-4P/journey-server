import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  GetAllProfilesRequestSchema,
  GetAllProfilesResponseSchema,
  GetProfileRequestSchema,
  GetProfileResponseSchema,
  UpdateProfileRequestSchema,
} from '../models';

export class GetProfileRequestDTO extends createZodDto(
  GetProfileRequestSchema
) {}
export class GetProfileResponseDTO extends createZodDto(
  GetProfileResponseSchema
) {}
export class GetAllProfilesRequestDTO extends createZodDto(
  GetAllProfilesRequestSchema
) {}
export class GetAllProfilesResponseDTO extends createZodDto(
  GetAllProfilesResponseSchema
) {}
export class UpdateProfileRequestDTO extends createZodDto(
  UpdateProfileRequestSchema.extend({
    facebookUrl: z.string().url().optional(),
    birthDate: z.string().datetime().optional(),
  })
) {}
