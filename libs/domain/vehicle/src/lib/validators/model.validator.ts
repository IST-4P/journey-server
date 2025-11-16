import { z } from 'zod';
import { VehicleTypeEnum } from '../enums';

export const ModelValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string({ message: 'Error.InvalidModelName' })
    .min(1, { message: 'Error.InvalidModelName' }),
  brandId: z
    .string({ message: 'Error.InvalidBrandId' })
    .uuid({ message: 'Error.InvalidBrandId' }),
  type: VehicleTypeEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ModelValidator = z.infer<typeof ModelValidatorSchema>;
