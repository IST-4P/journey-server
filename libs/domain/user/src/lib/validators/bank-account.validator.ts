import { z } from 'zod';

export const BankAccountValidatorSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bankName: z.string().min(1, { message: 'Error.InvalidBankName' }),
  bankCode: z.string().min(1, { message: 'Error.InvalidBankCode' }),
  accountNumber: z.string().min(1, { message: 'Error.InvalidAccountNumber' }),
  accountHolder: z
    .string()
    .min(2)
    .max(100, { message: 'Error.InvalidAccountHolder' }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BankAccountValidator = z.infer<typeof BankAccountValidatorSchema>;
