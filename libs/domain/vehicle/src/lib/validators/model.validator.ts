import { z } from 'zod';

export const ModelValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brandId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ModelValidator = z.infer<typeof ModelValidatorSchema>;
