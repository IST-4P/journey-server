import { RefreshToken, VerificationCode } from '@domain/auth';
import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUniqueVerificationCode(
    uniqueValue: Prisma.VerificationCodeWhereUniqueInput
  ): Promise<VerificationCode | null> {
    return this.prismaService.verificationCode.findUniqueOrThrow({
      where: uniqueValue,
    });
  }

  deleteVerificationCode(
    body: Prisma.VerificationCodeWhereUniqueInput
  ): Promise<VerificationCode> {
    return this.prismaService.verificationCode.delete({
      where: body,
    });
  }

  createVerificationCode(
    body: Prisma.VerificationCodeCreateInput
  ): Promise<VerificationCode> {
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
  ): Promise<RefreshToken> {
    return this.prismaService.refreshToken.create({
      data,
    });
  }

  deleteRefreshToken(
    where: Prisma.RefreshTokenWhereUniqueInput
  ): Promise<RefreshToken> {
    return this.prismaService.refreshToken.delete({
      where,
    });
  }

  findUniqueRefreshToken(
    token: Prisma.RefreshTokenWhereUniqueInput
  ): Promise<RefreshToken | null> {
    return this.prismaService.refreshToken.findUnique({
      where: token,
    });
  }
}
