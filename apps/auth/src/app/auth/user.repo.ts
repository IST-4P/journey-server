import { Injectable } from '@nestjs/common';
import { UserType } from './auth.model';

import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: Prisma.UserWhereUniqueInput): Promise<UserType | null> {
    return this.prismaService.user.findFirst({
      where,
    });
  }

  createUser(
    user: Prisma.UserCreateInput
  ): Promise<Omit<UserType, 'password'>> {
    return this.prismaService.user.create({
      data: user,
    });
  }

  update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ): Promise<Omit<UserType, 'password'>> {
    return this.prismaService.user.update({
      where,
      data,
    });
  }
}
