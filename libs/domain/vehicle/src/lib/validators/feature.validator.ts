import { z } from 'zod';

export const VehicleFeatureValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VehicleFeatureValidator = z.infer<
  typeof VehicleFeatureValidatorSchema
>;
