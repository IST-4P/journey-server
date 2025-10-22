import { z } from 'zod';
import { BankAccountValidatorSchema } from '../validators';

export const GetBankAccountRequestSchema = BankAccountValidatorSchema.pick({
  userId: true,
});

export const GetBankAccountResponseSchema = BankAccountValidatorSchema;

export const CreateBankAccountRequestSchema = BankAccountValidatorSchema.pick({
  userId: true,
  bankName: true,
  bankCode: true,
  accountNumber: true,
  accountHolder: true,
});

export const UpdateBankAccountRequestSchema =
  CreateBankAccountRequestSchema.partial().extend({
    userId: z.string().uuid(),
  });

export type GetBankAccountRequest = z.infer<typeof GetBankAccountRequestSchema>;
export type GetBankAccountResponse = z.infer<
  typeof GetBankAccountResponseSchema
>;
export type CreateBankAccountRequest = z.infer<
  typeof CreateBankAccountRequestSchema
>;
export type UpdateBankAccountRequest = z.infer<
  typeof UpdateBankAccountRequestSchema
>;
