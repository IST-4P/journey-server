import { z } from 'zod';
import { ModelValidatorSchema } from '../validators';

export const GetAllModelsRequestSchema = ModelValidatorSchema.pick({
  brandId: true,
}).partial();

export const GetAllModelsResponseSchema = z.object({
  models: z.array(
    ModelValidatorSchema.omit({
      createdAt: true,
      updatedAt: true,
    })
  ),
});

export const GetModelRequestSchema = ModelValidatorSchema.pick({
  id: true,
  name: true,
  brandId: true,
}).partial();

export const GetModelResponseSchema = ModelValidatorSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const CreateModelRequestSchema = ModelValidatorSchema.pick({
  name: true,
  brandId: true,
});

export const UpdateModelRequestSchema =
  CreateModelRequestSchema.partial().extend({
    id: z.string().uuid(),
  });

export const DeleteModelRequestSchema = ModelValidatorSchema.pick({
  id: true,
  name: true,
}).partial();

export type GetAllModelsRequest = z.infer<typeof GetAllModelsRequestSchema>;
export type GetAllModelsResponse = z.infer<typeof GetAllModelsResponseSchema>;
export type GetModelRequest = z.infer<typeof GetModelRequestSchema>;
export type GetModelResponse = z.infer<typeof GetModelResponseSchema>;
export type CreateModelRequest = z.infer<typeof CreateModelRequestSchema>;
export type UpdateModelRequest = z.infer<typeof UpdateModelRequestSchema>;
export type DeleteModelRequest = z.infer<typeof DeleteModelRequestSchema>;
