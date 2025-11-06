import { PaginationQuerySchema } from '@domain/shared';
import z from 'zod';
import { BookingValidatorSchema } from '../validators';

export const GetBookingRequestSchema = BookingValidatorSchema.pick({
  id: true,
  userId: true,
});

export const GetBookingResponseSchema = BookingValidatorSchema;

export const GetManyBookingsRequestSchema = BookingValidatorSchema.pick({
  userId: true,
  vehicleId: true,
  status: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyBookingsResponseSchema = z.object({
  bookings: z.array(BookingValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateBookingRequestSchema = BookingValidatorSchema.pick({
  userId: true,
  vehicleId: true,
  startTime: true,
  endTime: true,

  pickupAddress: true,
  pickupLat: true,
  pickupLng: true,

  notes: true,
}).extend({
  vehicleFeeHour: z.number().min(0),
  vehicleFeeDay: z.number().min(0),
});

export const CancelBookingRequestSchema = BookingValidatorSchema.pick({
  id: true,
  userId: true,
}).extend({
  cancelDate: z.coerce.date(),
  cancelReason: z.string(),
});

export const CancelBookingResponseSchema = GetBookingResponseSchema;

export const UpdateStatusBookingRequestSchema = BookingValidatorSchema.pick({
  id: true,
  userId: true,
  status: true,
});

export type GetBookingRequest = z.infer<typeof GetBookingRequestSchema>;
export type GetBookingResponse = z.infer<typeof GetBookingResponseSchema>;
export type GetManyBookingsRequest = z.infer<
  typeof GetManyBookingsRequestSchema
>;
export type GetManyBookingsResponse = z.infer<
  typeof GetManyBookingsResponseSchema
>;
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;
export type CancelBookingRequest = z.infer<typeof CancelBookingRequestSchema>;
export type CancelBookingResponse = z.infer<typeof CancelBookingResponseSchema>;
export type UpdateStatusBookingRequest = z.infer<
  typeof UpdateStatusBookingRequestSchema
>;
