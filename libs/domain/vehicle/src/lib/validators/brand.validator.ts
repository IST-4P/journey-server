import { z } from 'zod';
import { VehicleTypeEnum } from '../enums';

export const BrandValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: VehicleTypeEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BrandValidator = z.infer<typeof BrandValidatorSchema>;
