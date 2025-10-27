import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CreateCheckInOutRequestSchema,
  GetCheckInOutRequestSchema,
  GetCheckInOutResponseSchema,
  GetManyCheckInOutsRequestSchema,
  GetManyCheckInOutsResponseSchema,
  VerifyCheckInOutRequestSchema,
} from '../models';

export class GetManyCheckInOutsRequestDTO extends createZodDto(
  GetManyCheckInOutsRequestSchema
) {}
export class GetManyCheckInOutsResponseDTO extends createZodDto(
  GetManyCheckInOutsResponseSchema
) {}
export class GetCheckInOutRequestDTO extends createZodDto(
  GetCheckInOutRequestSchema
) {}
export class GetCheckInOutResponseDTO extends createZodDto(
  GetCheckInOutResponseSchema
) {}
export class CreateCheckInOutRequestDTO extends createZodDto(
  CreateCheckInOutRequestSchema.extend({
    address: z.string().optional(),
    damageNotes: z.string().optional(),
  })
) {}
export class VerifyCheckInOutRequestDTO extends createZodDto(
  VerifyCheckInOutRequestSchema
) {}
