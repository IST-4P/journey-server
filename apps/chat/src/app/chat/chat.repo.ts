import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatRequestType, GetChatsRequestType } from './chat.model';

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

  getChats(data: GetChatsRequestType) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;
    return this.prismaService.chat.findMany({
      where: {
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
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  createChat(data: CreateChatRequestType) {
    return this.prismaService.chat.create({
      data: {
        content: data.content,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
      },
    });
  }
}
