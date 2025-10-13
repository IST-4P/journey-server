import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { UserType } from '../models/auth.model';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: Prisma.UserWhereUniqueInput): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
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
