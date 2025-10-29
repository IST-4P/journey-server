import { PaginationQuerySchema } from '@domain/shared';
import z from 'zod';
import { CheckInOutValidatorSchema } from '../validators';

export const GetManyCheckInOutsRequestSchema = CheckInOutValidatorSchema.pick({
  bookingId: true,
  userId: true,
  type: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyCheckInOutsResponseSchema = z.object({
  checkInOuts: z.array(CheckInOutValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  id: true,
  userId: true,
});

export const GetCheckInOutResponseSchema = CheckInOutValidatorSchema;

export const CreateCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  bookingId: true,
  userId: true,
  type: true,
  latitude: true,
  longitude: true,
  address: true,
  images: true,
  mileage: true,
  fuelLevel: true,
  damageNotes: true,
  damageImages: true,
}).extend({
  checkDate: z.coerce.date(),
});

export const UpdateCheckOutRequestSchema = CheckInOutValidatorSchema.pick({
  mileage: true,
  fuelLevel: true,
  damageNotes: true,
  damageImages: true,
})
  .partial()
  .extend({
    id: CheckInOutValidatorSchema.shape.id,
    userId: CheckInOutValidatorSchema.shape.userId,
    penaltyAmount: z.number().int().optional(),
    damageAmount: z.number().int().optional(),
    overtimeAmount: z.number().int().optional(),
  });

export const VerifyCheckInOutRequestSchema = CheckInOutValidatorSchema.pick({
  id: true,
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
export type UpdateCheckOutRequest = z.infer<typeof UpdateCheckOutRequestSchema>;
export type VerifyCheckInOutRequest = z.infer<
  typeof VerifyCheckInOutRequestSchema
>;
