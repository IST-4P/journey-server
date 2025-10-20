import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from '@prisma-clients/vehicle';
import { z } from 'zod';

// ==================== BASE ENUM ======================

// ==================== BASE SCHEMA ====================
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(VehicleType),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  licensePlate: z.string(),

  seats: z.number().int(),
  fuelType: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),

  pricePerHour: z.number(),
  pricePerDay: z.number(),

  location: z.string(),
  city: z.string(),
  ward: z.string(),
  latitude: z.number(),
  longitude: z.number(),

  description: z.string(),
  terms: z.array(z.string()),

  status: z.nativeEnum(VehicleStatus),

  totalTrips: z.number().int(),
  averageRating: z.number(),
  totalReviewIds: z.array(z.string().uuid()),

  images: z.array(z.string().url()),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const GetVehicleRequestSchema = VehicleSchema.pick({
  id: true,
  licensePlate: true,
}).partial();

export const GetVehicleResponseSchema = VehicleSchema;

export const GetManyVehiclesRequestSchema = VehicleSchema.pick({
  id: true,
  type: true,
  name: true,
  brand: true,
  model: true,
  licensePlate: true,
  seats: true,
  fuelType: true,
  transmission: true,
  city: true,
  status: true,
  averageRating: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyVehiclesResponseSchema = z.object({
  vehicles: z.array(VehicleSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateVehicleRequestSchema = VehicleSchema.omit({
  id: true,
  totalTrips: true,
  totalReviewIds: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateVehicleRequestSchema =
  CreateVehicleRequestSchema.partial().extend({
    id: z.string().uuid(),
  });

export const DeleteVehicleRequestSchema = GetVehicleRequestSchema;

export type GetVehicleRequestType = z.infer<typeof GetVehicleRequestSchema>;
export type GetVehicleResponseType = z.infer<typeof GetVehicleResponseSchema>;
export type GetManyVehiclesRequestType = z.infer<
  typeof GetManyVehiclesRequestSchema
>;
export type GetManyVehiclesResponseType = z.infer<
  typeof GetManyVehiclesResponseSchema
>;
export type CreateVehicleRequestType = z.infer<
  typeof CreateVehicleRequestSchema
>;
export type UpdateVehicleRequestType = z.infer<
  typeof UpdateVehicleRequestSchema
>;
export type DeleteVehicleRequestType = z.infer<
  typeof DeleteVehicleRequestSchema
>;
