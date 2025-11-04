import { z } from 'zod';

export const UserValidatorSchema = z.object({
  id: z.string(),
  email: z.string().email({ message: 'Error.InvalidEmail' }),
  name: z.string().min(1, 'Error.InvalidName').max(100, 'Error.InvalidName'),
  phone: z.string().min(9).max(15),
  password: z.string({ message: 'Error.InvalidPassword' }).min(4).max(100),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserValidator = z.infer<typeof UserValidatorSchema>;
