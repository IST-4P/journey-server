import { z } from 'zod';

/**
 * Vehicle Type Enum
 */
export const VehicleTypeEnum = z.enum(['CAR', 'MOTORCYCLE']);
export type VehicleType = z.infer<typeof VehicleTypeEnum>;

/**
 * Fuel Type Enum
 */
export const FuelTypeEnum = z.enum([
  'GASOLINE',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
]);
export type FuelType = z.infer<typeof FuelTypeEnum>;

/**
 * Transmission Type Enum
 */
export const TransmissionTypeEnum = z.enum(['MANUAL', 'AUTOMATIC']);
export type TransmissionType = z.infer<typeof TransmissionTypeEnum>;

/**
 * Vehicle Status Enum
 */
export const VehicleStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE',
  'RESERVED',
  'RENTED',
]);
export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;
