import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyAddressByUserId(
    userId: Prisma.AddressWhereUniqueInput['userId']
  ) {
    return this.prisma.address.findMany({
      where: {
        userId,
      },
    });
  }

  async findAddressById({
    id,
    userId,
  }: {
    id: Prisma.AddressWhereUniqueInput['id'];
    userId: string;
  }) {
    return this.prisma.address.findUniqueOrThrow({
      where: { id, userId },
    });
  }

  async createAddress(data: Prisma.AddressUncheckedCreateInput) {
    return this.prisma.address.create({
      data,
    });
  }

  async updateAddress(
    {
      id,
      userId,
    }: {
      id: Prisma.AddressWhereUniqueInput['id'];
      userId: string;
    },
    data: Prisma.AddressUpdateInput
  ) {
    return this.prisma.address.update({
      where: { id, userId },
      data,
    });
  }
}
