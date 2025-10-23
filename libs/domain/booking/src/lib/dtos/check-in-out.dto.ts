import { createZodDto } from 'nestjs-zod';
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
  CreateCheckInOutRequestSchema
) {}
export class VerifyCheckInOutRequestDTO extends createZodDto(
  VerifyCheckInOutRequestSchema
) {}
