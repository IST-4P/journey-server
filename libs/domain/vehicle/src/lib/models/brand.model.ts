import { z } from 'zod';
import { BrandValidatorSchema } from '../validators';

export const GetAllBrandsResponseSchema = z.object({
  brands: z.array(
    BrandValidatorSchema.omit({ createdAt: true, updatedAt: true })
  ),
});

export const GetBrandRequestSchema = BrandValidatorSchema.pick({
  id: true,
  name: true,
}).partial();

export const GetBrandResponseSchema = BrandValidatorSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const CreateBrandRequestSchema = BrandValidatorSchema.pick({
  name: true,
});

export const UpdateBrandRequestSchema = BrandValidatorSchema.pick({
  id: true,
  name: true,
});

export const DeleteBrandRequestSchema = BrandValidatorSchema.pick({
  id: true,
  name: true,
}).partial();

export type GetAllBrandsResponse = z.infer<typeof GetAllBrandsResponseSchema>;
export type GetBrandRequest = z.infer<typeof GetBrandRequestSchema>;
export type GetBrandResponse = z.infer<typeof GetBrandResponseSchema>;
export type CreateBrandRequest = z.infer<typeof CreateBrandRequestSchema>;
export type UpdateBrandRequest = z.infer<typeof UpdateBrandRequestSchema>;
export type DeleteBrandRequest = z.infer<typeof DeleteBrandRequestSchema>;
