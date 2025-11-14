import z from 'zod';

export const ComplaintStatusValues = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const ComplaintStatusEnum = z.enum([
  ComplaintStatusValues.OPEN,
  ComplaintStatusValues.IN_PROGRESS,
  ComplaintStatusValues.RESOLVED,
  ComplaintStatusValues.CLOSED,
]);

export const ComplaintMessageTypeValues = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;

export const ComplaintMessageTypeEnum = z.enum([
  ComplaintMessageTypeValues.TEXT,
  ComplaintMessageTypeValues.IMAGE,
]);

export type ComplaintStatusEnumType = z.infer<typeof ComplaintStatusEnum>;
export type ComplaintMessageTypeEnumType = z.infer<
  typeof ComplaintMessageTypeEnum
>;
