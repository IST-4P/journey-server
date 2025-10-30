import { z } from 'zod';
import { DeviceStatusEnum } from '../enums';

export const DeviceValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().min(0),
  description: z.string(),
  status: DeviceStatusEnum,
  quantity: z.number().int().min(0),
  information: z.array(z.string()),
  images: z.array(z.string()),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ComboDeviceItemValidatorSchema = z.object({
  deviceId: z.string().uuid(),
  deviceName: z.string(),
  devicePrice: z.number().min(0),
  quantity: z.number().int().min(1),
});

export const ComboValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().min(0),
  description: z.string(),
  images: z.array(z.string()),
  devices: z.array(ComboDeviceItemValidatorSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DeviceValidator = z.infer<typeof DeviceValidatorSchema>;
export type ComboDeviceItemValidator = z.infer<
  typeof ComboDeviceItemValidatorSchema
>;
export type ComboValidator = z.infer<typeof ComboValidatorSchema>;
