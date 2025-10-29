import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  CancelBookingRequestSchema,
  CancelBookingResponseSchema,
  CreateBookingRequestSchema,
  GetBookingRequestSchema,
  GetBookingResponseSchema,
  GetManyBookingsRequestSchema,
  GetManyBookingsResponseSchema,
} from '../models';

export class GetBookingRequestDTO extends createZodDto(
  GetBookingRequestSchema
) {}
export class GetBookingResponseDTO extends createZodDto(
  GetBookingResponseSchema
) {}
export class GetManyBookingsRequestDTO extends createZodDto(
  GetManyBookingsRequestSchema
) {}
export class GetManyBookingsResponseDTO extends createZodDto(
  GetManyBookingsResponseSchema
) {}
export class CreateBookingRequestDTO extends createZodDto(
  CreateBookingRequestSchema.extend({
    notes: z.string().optional(),
  })
) {}
export class CancelBookingRequestDTO extends createZodDto(
  CancelBookingRequestSchema
) {}
export class CancelBookingResponseDTO extends createZodDto(
  CancelBookingResponseSchema
) {}
