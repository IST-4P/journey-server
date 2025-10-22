import z from 'zod';
import { CheckInOutValidatorSchema } from '../validators';

export const GetManyCheckInOutsRequestSchema = CheckInOutValidatorSchema.pick({
  bookingId: true,
  type: true,
}).partial();

export const GetManyCheckInOutsResponseSchema = z.object({
  checkInOuts: z.array(CheckInOutValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  id: true,
});

export const GetCheckInOutResponseSchema = CheckInOutValidatorSchema;

export const CreateCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  bookingId: true,
  type: true,
  latitude: true,
  longitude: true,
  address: true,
  images: true,
  mileage: true,
  fuelLevel: true,
  damageNotes: true,
  damageImages: true,
});

export const VerifyCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  id: true,
  verified: true,
  verifiedAt: true,
});

export type GetManyCheckInOutsRequest = z.infer<
  typeof GetManyCheckInOutsRequestSchema
>;
export type GetManyCheckInOutsResponse = z.infer<
  typeof GetManyCheckInOutsResponseSchema
>;
export type GetCheckInOutRequest = z.infer<typeof GetCheckInOutRequestSchema>;
export type GetCheckInOutResponse = z.infer<typeof GetCheckInOutResponseSchema>;
export type CreateCheckInOutRequest = z.infer<
  typeof CreateCheckInOutRequestSchema
>;
export type VerifyCheckInOutRequest = z.infer<
  typeof VerifyCheckInOutRequestSchema
>;
