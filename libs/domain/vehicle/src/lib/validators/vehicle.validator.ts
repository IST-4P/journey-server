import { z } from 'zod';
import {
  FuelTypeEnum,
  TransmissionTypeEnum,
  VehicleStatusEnum,
  VehicleTypeEnum,
} from '../enums';
import { VehicleFeatureValidatorSchema } from './feature.validator';

export const VehicleValidatorSchema = z.object({
  id: z.string().uuid(),
  type: VehicleTypeEnum,
  name: z.string().min(1),
  brandId: z.string().uuid(),
  modelId: z.string().uuid(),
  licensePlate: z.string().min(1),
  seats: z.coerce.number().int().positive(),
  fuelType: FuelTypeEnum,
  transmission: TransmissionTypeEnum,
  pricePerHour: z.number().positive(),
  pricePerDay: z.number().positive(),
  location: z.string(),
  city: z.string(),
  ward: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string(),
  terms: z.array(z.string()),
  status: VehicleStatusEnum,
  totalTrips: z.number().int().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  totalReviewIds: z.array(z.string().uuid()),
  images: z.array(z.string().url()),
  vehicleFeatures: z
    .array(
      z.object({
        feature: VehicleFeatureValidatorSchema.pick({
          name: true,
          icon: true,
          description: true,
        }),
      })
    )
    .optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VehicleValidator = z.infer<typeof VehicleValidatorSchema>;
