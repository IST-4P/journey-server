import { PaginationQuerySchema } from '@hacmieu-journey/nestjs';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class FindAllProfilesQueryDTO extends createZodDto(
  z
    .object({
      fullName: z.string({ message: 'Error.InvalidFullName' }),
      phone: z.string({ message: 'Error.InvalidPhone' }),
      email: z.string().email({ message: 'Error.InvalidEmail' }),
      role: z.enum(['USER', 'ADMIN'], { message: 'Error.InvalidRole' }),
    })
    .partial()
    .extend(PaginationQuerySchema.shape)
) {}

export class UpdateProfileRequestDTO extends createZodDto(
  z
    .object({
      fullName: z.string({ message: 'Error.InvalidFullName' }),
      phone: z.string({ message: 'Error.InvalidPhone' }),
      email: z.string().email({ message: 'Error.InvalidEmail' }),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        message: 'Error.InvalidGender',
      }),
      dateOfBirth: z.coerce
        .date({ message: 'Error.InvalidDateOfBirth' })
        .transform((date) => date.toISOString()),
      avatar: z.string({ message: 'Error.InvalidAvatar' }),
    })
    .partial()
) {}

const LicenseClassEnum = z.enum(['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F']);

export class CreateDriverLicenseRequestDTO extends createZodDto(
  z.object({
    licenseNumber: z.string().min(1, { message: 'Error.InvalidLicenseNumber' }),
    fullName: z
      .string({ message: 'Error.InvalidFullName' })
      .min(2)
      .max(100, { message: 'Error.InvalidFullName' }),
    dateOfBirth: z.coerce
      .date({ message: 'Error.InvalidDateOfBirth' })
      .transform((date) => date.toISOString()),
    licenseClass: z.string({ message: 'Error.InvalidLicenseClass' }),
    issueDate: z.coerce
      .date({ message: 'Error.InvalidIssueDate' })
      .transform((date) => date.toISOString()),
    expiryDate: z.coerce
      .date({ message: 'Error.InvalidExpiryDate' })
      .transform((date) => date.toISOString()),
    issuePlace: z.string().min(1, { message: 'Error.InvalidIssuePlace' }),
    frontImageUrl: z.string({ message: 'Error.InvalidFrontImage' }),
    backImageUrl: z.string({ message: 'Error.InvalidBackImage' }),
    selfieImageUrl: z.string({ message: 'Error.InvalidSelfieImage' }),
  })
) {}

export class UpdateDriverLicenseRequestDTO extends createZodDto(
  z
    .object({
      licenseNumber: z
        .string()
        .min(1, { message: 'Error.InvalidLicenseNumber' }),
      fullName: z.string({ message: 'Error.InvalidFullName' }).min(2).max(100),
      dateOfBirth: z.coerce
        .date({ message: 'Error.InvalidDateOfBirth' })
        .transform((date) => date.toISOString()),
      licenseClass: LicenseClassEnum,
      issueDate: z.coerce
        .date({ message: 'Error.InvalidIssueDate' })
        .transform((date) => date.toISOString()),
      expiryDate: z.coerce
        .date({ message: 'Error.InvalidExpiryDate' })
        .transform((date) => date.toISOString()),
      issuePlace: z.string().min(1, { message: 'Error.InvalidIssuePlace' }),
      frontImageUrl: z.string({ message: 'Error.InvalidFrontImage' }),
      backImageUrl: z.string({ message: 'Error.InvalidBackImage' }),
      selfieImageUrl: z.string({ message: 'Error.InvalidSelfieImage' }),
    })
    .partial()
) {}

export class CreateBankAccountRequestDTO extends createZodDto(
  z.object({
    bankName: z.string().min(1, { message: 'Error.InvalidBankName' }),
    bankCode: z.string().min(1, { message: 'Error.InvalidBankCode' }),
    accountNumber: z.string().min(1, { message: 'Error.InvalidAccountNumber' }),
    accountHolder: z
      .string({ message: 'Error.InvalidAccountHolder' })
      .min(2)
      .max(100),
  })
) {}

export class UpdateBankAccountRequestDTO extends createZodDto(
  z
    .object({
      bankName: z.string({ message: 'Error.InvalidBankName' }).min(1),
      bankCode: z.string({ message: 'Error.InvalidBankCode' }).min(1),
      accountNumber: z.string({ message: 'Error.InvalidAccountNumber' }).min(1),
      accountHolder: z
        .string({ message: 'Error.InvalidAccountHolder' })
        .min(2)
        .max(100),
    })
    .partial()
) {}

export class GetAddressQueryDTO extends createZodDto(
  z.object({
    id: z.string({ message: 'Error.InvalidId' }).min(1).optional(),
    userId: z.string({ message: 'Error.InvalidUserId' }).min(1),
  })
) {}

export class CreateAddressRequestDTO extends createZodDto(
  z.object({
    label: z.string({ message: 'Error.InvalidLabel' }).min(1),
    city: z.string({ message: 'Error.InvalidCity' }).min(1),
    ward: z.string({ message: 'Error.InvalidWard' }).min(1),
    detail: z.string({ message: 'Error.InvalidDetail' }).min(1),
    latitude: z
      .number({ message: 'Error.InvalidLatitude' })

      .optional(),
    longitude: z
      .number({ message: 'Error.InvalidLongitude' })

      .optional(),
  })
) {}

export class UpdateAddressQueryDTO extends createZodDto(
  z.object({
    id: z.string({ message: 'Error.InvalidId' }).min(1),
    userId: z.string({ message: 'Error.InvalidUserId' }).min(1),
  })
) {}

export class UpdateAddressRequestDTO extends createZodDto(
  z
    .object({
      label: z.string({ message: 'Error.InvalidLabel' }).min(1),
      city: z.string({ message: 'Error.InvalidCity' }).min(1),
      ward: z.string({ message: 'Error.InvalidWard' }).min(1),
      detail: z.string({ message: 'Error.InvalidDetail' }).min(1),
      latitude: z.number({ message: 'Error.InvalidLatitude' }),
      longitude: z.number({ message: 'Error.InvalidLongitude' }),
    })
    .partial()
) {}

export class DeleteAddressQueryDTO extends UpdateAddressQueryDTO {}
