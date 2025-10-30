import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { VehicleValidatorSchema } from '../validators';

export const GetVehicleRequestSchema = VehicleValidatorSchema.pick({
  id: true,
  licensePlate: true,
}).partial();

export const GetVehicleResponseSchema = VehicleValidatorSchema.omit({
  licensePlate: true,
});

export const GetManyVehiclesRequestSchema = VehicleValidatorSchema.pick({
  id: true,
  type: true,
  name: true,
  brandId: true,
  modelId: true,
  licensePlate: true,
  seats: true,
  fuelType: true,
  transmission: true,
  city: true,
  ward: true,
  status: true,
  averageRating: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyVehiclesResponseSchema = z.object({
  vehicles: z.array(
    VehicleValidatorSchema.omit({ vehicleFeatures: true, licensePlate: true })
  ),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateVehicleRequestSchema = VehicleValidatorSchema.omit({
  id: true,
  totalTrips: true,
  averageRating: true,
  totalReviewIds: true,
  createdAt: true,
  updatedAt: true,
  vehicleFeatures: true,
}).extend({
  featureIds: z.array(z.string().uuid()),
});

export const UpdateVehicleRequestSchema =
  CreateVehicleRequestSchema.partial().extend({
    id: z.string().uuid(),
  });

export const DeleteVehicleRequestSchema = GetVehicleRequestSchema;

export type GetVehicleRequest = z.infer<typeof GetVehicleRequestSchema>;
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;
export type GetManyVehiclesRequest = z.infer<
  typeof GetManyVehiclesRequestSchema
>;
export type GetManyVehiclesResponse = z.infer<
  typeof GetManyVehiclesResponseSchema
>;
export type CreateVehicleRequest = z.infer<typeof CreateVehicleRequestSchema>;
export type UpdateVehicleRequest = z.infer<typeof UpdateVehicleRequestSchema>;
export type DeleteVehicleRequest = z.infer<typeof DeleteVehicleRequestSchema>;
