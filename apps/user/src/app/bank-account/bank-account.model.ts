import { z } from 'zod';

// ==================== BASE SCHEMA ====================

export const BankAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bankName: z.string().min(1),
  bankCode: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(2).max(100),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const GetBankAccountRequestSchema = BankAccountSchema.pick({
  userId: true,
});

export const GetBankAccountResponseSchema = BankAccountSchema;

export const CreateBankAccountRequestSchema = BankAccountSchema.pick({
  userId: true,
  bankName: true,
  bankCode: true,
  accountNumber: true,
  accountHolder: true,
});

export const UpdateBankAccountRequestSchema =
  CreateBankAccountRequestSchema.partial().extend({
    userId: z.string(),
  });

export type GetBankAccountRequestType = z.infer<
  typeof GetBankAccountRequestSchema
>;
export type GetBankAccountResponseType = z.infer<
  typeof GetBankAccountResponseSchema
>;
export type UpdateBankAccountRequestType = z.infer<
  typeof UpdateBankAccountRequestSchema
>;
export type CreateBankAccountRequestType = z.infer<
  typeof CreateBankAccountRequestSchema
>;
