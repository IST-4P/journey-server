import { createZodDto } from 'nestjs-zod';
import {
  CreateBankAccountRequestSchema,
  GetBankAccountRequestSchema,
  GetBankAccountResponseSchema,
  UpdateBankAccountRequestSchema,
} from '../models';

export class GetBankAccountRequestDTO extends createZodDto(
  GetBankAccountRequestSchema
) {}

export class GetBankAccountResponseDTO extends createZodDto(
  GetBankAccountResponseSchema
) {}

export class CreateBankAccountRequestDTO extends createZodDto(
  CreateBankAccountRequestSchema
) {}

export class UpdateBankAccountRequestDTO extends createZodDto(
  UpdateBankAccountRequestSchema
) {}
