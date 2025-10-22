import { z } from 'zod';
import { VehicleFeatureValidatorSchema } from '../validators';
// ==================== VEHICLE FEATURE DTOs ====================

export const GetFeatureRequestSchema = VehicleFeatureValidatorSchema.pick({
  id: true,
  name: true,
}).partial();

export const GetFeatureResponseSchema = VehicleFeatureValidatorSchema;

export const GetAllFeaturesResponseSchema = z.object({
  features: z.array(
    VehicleFeatureValidatorSchema.pick({
      id: true,
      name: true,
      description: true,
      icon: true,
    })
  ),
});

export const CreateFeatureRequestSchema = VehicleFeatureValidatorSchema.pick({
  name: true,
  description: true,
  icon: true,
});

export const UpdateFeatureRequestSchema =
  CreateFeatureRequestSchema.partial().extend({
    id: z.string().uuid(),
  });

export const DeleteFeatureRequestSchema = VehicleFeatureValidatorSchema.pick({
  id: true,
});

export type GetFeatureRequest = z.infer<typeof GetFeatureRequestSchema>;
export type GetFeatureResponse = z.infer<typeof GetFeatureResponseSchema>;
export type GetAllFeaturesResponse = z.infer<
  typeof GetAllFeaturesResponseSchema
>;
export type CreateFeatureRequest = z.infer<typeof CreateFeatureRequestSchema>;
export type UpdateFeatureRequest = z.infer<typeof UpdateFeatureRequestSchema>;
export type DeleteFeatureRequest = z.infer<typeof DeleteFeatureRequestSchema>;
