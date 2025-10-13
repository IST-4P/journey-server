import { Injectable } from '@nestjs/common';
import { RefreshTokenType, VerificationCodeType } from '../models/auth.model';

import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUniqueVerificationCode(
    uniqueValue: Prisma.VerificationCodeWhereUniqueInput
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUniqueOrThrow({
      where: uniqueValue,
    });
  }

  deleteVerificationCode(
    body: Prisma.VerificationCodeWhereUniqueInput
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: body,
    });
  }

  createVerificationCode(
    body: Prisma.VerificationCodeCreateInput
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

  findUniqueRefreshToken(
    token: Prisma.RefreshTokenWhereUniqueInput
  ): Promise<RefreshTokenType | null> {
    return this.prismaService.refreshToken.findUniqueOrThrow({
      where: token,
    });
  }
}
