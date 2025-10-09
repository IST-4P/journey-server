import { Injectable } from '@nestjs/common';
import {
  RefreshTokenType,
  TypeOfVerificationCodeType,
  VerificationCodeType,
} from './auth.model';

import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // createUser(
  //   user: Pick<UserType, 'email' | 'name' | 'phoneNumber' | 'password' | 'roleId' | 'avatar'>,
  // ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
  //   return this.prismaService.user.create({
  //     data: user,
  //     omit: {
  //       password: true,
  //       totpSecret: true,
  //     },
  //   })
  // }

  // createUserIncludeRole(
  //   user: Pick<UserType, 'email' | 'name' | 'phoneNumber' | 'password' | 'roleId' | 'avatar'>,
  // ): Promise<UserType & { role: RoleType }> {
  //   return this.prismaService.user.create({
  //     data: user,
  //     include: {
  //       role: true,
  //     },
  //   })
  // }

  findUniqueVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email_type: { email: string; type: TypeOfVerificationCodeType };
        }
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }

  deleteVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email_type: { email: string; type: TypeOfVerificationCodeType };
        }
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: uniqueValue,
    });
  }

  createVerificationCode(
    body: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: body.email,
          type: body.type,
        },
      },
      create: body,
      update: {
        code: body.code,
        expiresAt: body.expiresAt,
      },
    });
  }

  // findUniqueUserIncludeRole(where: WhereUniqueUserType): Promise<(UserType & { role: RoleType }) | null> {
  //   return this.prismaService.user.findFirst({
  //     where: {
  //       ...where,
  //       deletedAt: null,
  //     },
  //     include: {
  //       role: true,
  //     },
  //   })
  // }

  createRefreshToken(
    data: Prisma.RefreshTokenUncheckedCreateInput
  ): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.create({
      data,
    });
  }

  deleteRefreshToken(
    where: Prisma.RefreshTokenWhereUniqueInput
  ): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where,
    });
  }

  findUniqueRefreshToken(token: string): Promise<RefreshTokenType | null> {
    return this.prismaService.refreshToken.findUnique({
      where: {
        token,
      },
    });
  }
}
