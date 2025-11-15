import { PaginationQuerySchema } from '@domain/shared';
import z from 'zod';
import { ComplaintMessageValidatorSchema } from '../validators';

export const CreateComplaintMessageRequestSchema =
  ComplaintMessageValidatorSchema.pick({
    complaintId: true,
    senderId: true,
    messageType: true,
    content: true,
  });

export const GetManyComplaintMessagesRequestSchema =
  ComplaintMessageValidatorSchema.pick({
    complaintId: true,
  }).extend(PaginationQuerySchema.shape);

export const GetManyComplaintMessagesResponseSchema = z.object({
  complaintMessages: z.array(ComplaintMessageValidatorSchema),
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
});

export type CreateComplaintMessageRequest = z.infer<
  typeof CreateComplaintMessageRequestSchema
>;
export type GetManyComplaintMessagesRequest = z.infer<
  typeof GetManyComplaintMessagesRequestSchema
>;
export type GetManyComplaintMessagesResponse = z.infer<
  typeof GetManyComplaintMessagesResponseSchema
>;
