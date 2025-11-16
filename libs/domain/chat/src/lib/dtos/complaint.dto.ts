import { createZodDto } from 'nestjs-zod';
import {
  CreateComplaintRequestSchema,
  GetComplaintRequestSchema,
  GetComplaintResponseSchema,
  GetManyComplaintsRequestSchema,
  GetManyComplaintsResponseSchema,
  UpdateComplaintStatusRequestSchema,
} from '../models';

export class GetManyComplaintsRequestDTO extends createZodDto(
  GetManyComplaintsRequestSchema
) {}
export class GetManyComplaintsResponseDTO extends createZodDto(
  GetManyComplaintsResponseSchema
) {}
export class CreateComplaintRequestDTO extends createZodDto(
  CreateComplaintRequestSchema
) {}
export class GetComplaintRequestDTO extends createZodDto(
  GetComplaintRequestSchema
) {}
export class GetComplaintResponseDTO extends createZodDto(
  GetComplaintResponseSchema
) {}
export class UpdateComplaintStatusRequestDTO extends createZodDto(
  UpdateComplaintStatusRequestSchema
) {}
