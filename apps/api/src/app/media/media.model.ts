import { z } from 'zod';

export const PresignedUploadFileBodySchema = z
  .object({
    filename: z.string(),
  })
  .strict();

export const PresignedUploadFileResSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
});

export type PresignedUploadFileBodyType = z.infer<
  typeof PresignedUploadFileBodySchema
>;
