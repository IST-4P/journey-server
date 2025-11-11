import { z } from 'zod';

export const BlogValidatorSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  region: z.string(),
  tag: z.string(),
  summary: z.string(),
  thumbnail: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type BlogValidator = z.infer<typeof BlogValidatorSchema>;
