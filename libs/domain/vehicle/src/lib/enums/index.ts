import { z } from 'zod';

export const VehicleTypeValues = {
  CAR: 'CAR',
  MOTORCYCLE: 'MOTORCYCLE',
} as const;

export const VehicleTypeEnum = z.enum([
  VehicleTypeValues.CAR,
  VehicleTypeValues.MOTORCYCLE,
]);

export const FuelTypeValues = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
  UNLEADED_GASOLINE: 'UNLEADED_GASOLINE',
} as const;

export const FuelTypeEnum = z.enum([
  FuelTypeValues.GASOLINE,
  FuelTypeValues.DIESEL,
  FuelTypeValues.ELECTRIC,
  FuelTypeValues.HYBRID,
  FuelTypeValues.UNLEADED_GASOLINE,
]);

export const TransmissionTypeValues = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
} as const;

export const TransmissionTypeEnum = z.enum([
  TransmissionTypeValues.MANUAL,
  TransmissionTypeValues.AUTOMATIC,
]);

export const VehicleStatusValues = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  RENTED: 'RENTED',
} as const;

export const VehicleStatusEnum = z.enum([
  VehicleStatusValues.ACTIVE,
  VehicleStatusValues.INACTIVE,
  VehicleStatusValues.MAINTENANCE,
  VehicleStatusValues.RESERVED,
  VehicleStatusValues.RENTED,
]);

export type VehicleType = z.infer<typeof VehicleTypeEnum>;
export type FuelType = z.infer<typeof FuelTypeEnum>;
export type TransmissionType = z.infer<typeof TransmissionTypeEnum>;
export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;
