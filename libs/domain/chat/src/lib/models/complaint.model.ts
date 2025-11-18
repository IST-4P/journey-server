import { PaginationQuerySchema } from '@domain/shared';
import { z } from 'zod';
import { ComplaintValidatorSchema } from '../validators';

export const GetComplaintRequestSchema = ComplaintValidatorSchema.pick({
  id: true,
});

export const GetComplaintResponseSchema = ComplaintValidatorSchema;

export const GetManyComplaintsRequestSchema = ComplaintValidatorSchema.pick({
  status: true,
  userId: true,
})
  .partial()
  .extend(PaginationQuerySchema.shape);

export const GetManyComplaintsResponseSchema = z.object({
  complaints: z.array(
    ComplaintValidatorSchema.omit({ updatedAt: true, id: true }).extend({
      status: z.string(),
      complaintId: z.string().uuid(),
      lastMessage: z.string(),
      lastMessageAt: z.coerce.date(),
    })
  ),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export const CreateComplaintRequestSchema = ComplaintValidatorSchema.pick({
  userId: true,
  title: true,
});

export const UpdateComplaintStatusRequestSchema = ComplaintValidatorSchema.pick(
  {
    id: true,
    status: true,
  }
);

export type GetComplaintRequest = z.infer<typeof GetComplaintRequestSchema>;
export type GetComplaintResponse = z.infer<typeof GetComplaintResponseSchema>;
export type GetManyComplaintsRequest = z.infer<
  typeof GetManyComplaintsRequestSchema
>;
export type GetManyComplaintsResponse = z.infer<
  typeof GetManyComplaintsResponseSchema
>;
export type CreateComplaintRequest = z.infer<
  typeof CreateComplaintRequestSchema
>;
export type UpdateComplaintStatusRequest = z.infer<
  typeof UpdateComplaintStatusRequestSchema
>;
