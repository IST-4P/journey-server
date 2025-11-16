import z from 'zod';

export const DeviceStatusValues = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',

} as const;

export const DeviceStatusEnum = z.enum([
  DeviceStatusValues.AVAILABLE,
  DeviceStatusValues.UNAVAILABLE,
]);

export const ComboStatusValues = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export const ComboStatusEnum = z.enum([
  ComboStatusValues.ACTIVE,
  ComboStatusValues.INACTIVE,
]);

export type DeviceStatus = z.infer<typeof DeviceStatusEnum>;
export type ComboStatus = z.infer<typeof ComboStatusEnum>;
