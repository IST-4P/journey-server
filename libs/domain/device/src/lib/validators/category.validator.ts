import { z } from 'zod';

export const CategoryValidatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  logoUrl: z.string().url(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategoryValidator = z.infer<typeof CategoryValidatorSchema>;
