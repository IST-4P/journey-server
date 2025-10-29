import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ExtensionValidatorSchema } from '../validators';

export const GetManyExtensionsRequestSchema = ExtensionValidatorSchema.pick({
  status: true,
  requestedBy: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyExtensionsResponseSchema = z.object({
  extensions: z.array(ExtensionValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const GetExtensionRequestSchema = ExtensionValidatorSchema.pick({
  id: true,
  requestedBy: true,
});

export const GetExtensionResponseSchema = ExtensionValidatorSchema;

export const CreateExtensionRequestSchema = ExtensionValidatorSchema.pick({
  bookingId: true,
  requestedBy: true,
  originalEndTime: true,
  newEndTime: true,
  notes: true,
});

export const UpdateExtensionRequestSchema = ExtensionValidatorSchema.pick({
  id: true,
  newEndTime: true,
  additionalHours: true,
  additionalAmount: true,
  notes: true,
});

export const UpdateStatusExtensionRequestSchema = ExtensionValidatorSchema.pick(
  {
    id: true,
    rejectionReason: true,
  }
);

export type GetManyExtensionsRequest = z.infer<
  typeof GetManyExtensionsRequestSchema
>;
export type GetManyExtensionsResponse = z.infer<
  typeof GetManyExtensionsResponseSchema
>;
export type GetExtensionRequest = z.infer<typeof GetExtensionRequestSchema>;
export type GetExtensionResponse = z.infer<typeof GetExtensionResponseSchema>;
export type CreateExtensionRequest = z.infer<
  typeof CreateExtensionRequestSchema
>;
export type UpdateExtensionRequest = z.infer<
  typeof UpdateExtensionRequestSchema
>;
export type UpdateStatusExtensionRequest = z.infer<
  typeof UpdateStatusExtensionRequestSchema
>;
