import { z } from 'zod';

// ==================== BASE SCHEMA ====================
export const FeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetFeatureRequestSchema = FeatureSchema.pick({
  id: true,
});

export const GetFeatureResponseSchema = FeatureSchema;

export const GetAllFeaturesResponseSchema = z.object({
  features: z.array(
    FeatureSchema.pick({
      id: true,
      name: true,
      description: true,
      icon: true,
    })
  ),
});

export const CreateFeatureRequestSchema = FeatureSchema.pick({
  name: true,
  description: true,
  icon: true,
});

export const UpdateFeatureRequestSchema =
  CreateFeatureRequestSchema.partial().extend({
    id: z.string().uuid(),
  });

export const DeleteFeatureRequestSchema = FeatureSchema.pick({
  id: true,
});

export type GetFeatureRequestType = z.infer<typeof GetFeatureRequestSchema>;
export type GetFeatureResponseType = z.infer<typeof GetFeatureResponseSchema>;
export type GetAllFeaturesResponseType = z.infer<
  typeof GetAllFeaturesResponseSchema
>;
export type CreateFeatureRequestType = z.infer<
  typeof CreateFeatureRequestSchema
>;
export type UpdateFeatureRequestType = z.infer<
  typeof UpdateFeatureRequestSchema
>;
export type DeleteFeatureRequestType = z.infer<
  typeof DeleteFeatureRequestSchema
>;
