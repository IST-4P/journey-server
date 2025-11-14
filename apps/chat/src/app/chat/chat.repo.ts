import { CreateChatRequest, GetChatsRequest } from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-clients/chat';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // async getConversations(userId: number) {
  //   const messages = await this.prismaService.chat.findMany({
  //     where: {
  //       OR: [{ fromUserId: userId }, { toUserId: userId }],
  //     },
  //     orderBy: { createdAt: 'desc' },
  //     include: {
  //       fromUser: { select: { id: true, name: true } },
  //       toUser: { select: { id: true, name: true } },
  //     },
  //   });

  //   const conversations: {
  //     user: { id: number; name: string };
  //     lastChat: {
  //       id: number;
  //       fromUserId: number;
  //       toUserId: number;
  //       content: string;
  //       createdAt: Date;
  //     };
  //   }[] = [];
  //   const partnerIds = new Set<number>();

  //   for (const message of messages) {
  //     const partner =
  //       message.fromUserId === userId ? message.toUser : message.fromUser;
  //     if (!partnerIds.has(partner.id)) {
  //       conversations.push({
  //         user: partner,
  //         lastChat: {
  //           id: message.id,
  //           fromUserId: message.fromUserId,
  //           toUserId: message.toUserId,
  //           content: message.content,
  //           createdAt: message.createdAt,
  //         },
  //       });
  //       partnerIds.add(partner.id);
  //     }
  //   }

  //   return conversations;
  // }

  async getChats(data: GetChatsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    const where: Prisma.ChatWhereInput = {
      OR: [
        // Trường hợp 1: Tin nhắn từ người dùng hiện tại gửi cho người kia.
        {
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
        },
        // Trường hợp 2: Tin nhắn từ người kia gửi cho người dùng hiện tại.
        {
          fromUserId: data.toUserId,
          toUserId: data.fromUserId,
        },
      ],
    };
    const [totalItems, chats] = await Promise.all([
      this.prismaService.chat.count({ where }),
      this.prismaService.chat.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      chats,
      page: data.page,
      limit: data.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  createChat(data: CreateChatRequest) {
    return this.prismaService.chat.create({
      data: {
        content: data.content,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
      },
    });
  }
}
