import { z } from 'zod';
import { ComplaintMessageTypeEnum, ComplaintStatusEnum } from '../enums';

export const ChatValidatorSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  content: z.string(),
  createdAt: z.date(),
});

export const ComplaintValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  status: ComplaintStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ComplaintMessageValidatorSchema = z.object({
  id: z.string().uuid(),
  complaintId: z.string().uuid(),
  senderId: z.string().uuid(),
  messageType: ComplaintMessageTypeEnum,
  content: z.string(),
  createdAt: z.date(),
});

export type ChatValidator = z.infer<typeof ChatValidatorSchema>;
export type ComplaintValidator = z.infer<typeof ComplaintValidatorSchema>;
