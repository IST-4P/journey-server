import { ChatProto, UserProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService implements OnModuleInit {
  private chatService!: ChatProto.ChatServiceClient;
  private userService!: UserProto.UserServiceClient;

  constructor(
    @Inject(ChatProto.CHAT_PACKAGE_NAME)
    private chatClient: ClientGrpc,
    @Inject(UserProto.USER_PACKAGE_NAME)
    private userClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.chatService = this.chatClient.getService<ChatProto.ChatServiceClient>(
      ChatProto.CHAT_SERVICE_NAME
    );
    this.userService = this.userClient.getService<UserProto.UserServiceClient>(
      UserProto.USER_SERVICE_NAME
    );
  }

  getChats(
    data: ChatProto.GetChatsRequest
  ): Promise<ChatProto.GetChatsResponse> {
    return lastValueFrom(this.chatService.getChats(data));
  }

  async getManyConversations(
    data: ChatProto.GetManyConversationsRequest
  ): Promise<ChatProto.GetManyConversationsWithUserIds> {
    const conversations = await lastValueFrom(
      this.chatService.getManyConversations(data)
    );

    const userIds = conversations.conversations.map((c) => c.id);
    const usersResponse = await lastValueFrom(
      this.userService.getFullNameAndAvatar({
        userIds,
      })
    );
    const result = {
      conversations: usersResponse.users.map((item, index) => {
        const lastMessageDate = new Date(
          conversations.conversations[index].lastMessageAt
        );
        return {
          id: item.id,
          fullName: item.fullName,
          avatarUrl: item.avatarUrl,
          lastMessage: conversations.conversations[index].lastMessage,
          lastMessageAt: `${lastMessageDate
            .getHours()
            .toString()
            .padStart(2, '0')}:${lastMessageDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`,
        };
      }),
      page: conversations.page,
      limit: conversations.limit,
      totalItems: conversations.totalItems,
      totalPages: conversations.totalPages,
    };
    return result;
  }

  updateComplaintStatus(
    data: ChatProto.UpdateComplaintStatusRequest
  ): Promise<ChatProto.GetComplaintResponse> {
    return lastValueFrom(this.chatService.updateComplaintStatus(data));
  }

  getManyComplaints(
    data: ChatProto.GetManyComplaintsRequest
  ): Promise<ChatProto.GetManyComplaintsResponse> {
    return lastValueFrom(this.chatService.getManyComplaints(data));
  }

  getManyComplaintMessages(
    data: ChatProto.GetManyComplaintMessagesRequest
  ): Promise<ChatProto.GetManyComplaintMessagesResponse> {
    return lastValueFrom(this.chatService.getManyComplaintMessages(data));
  }
}
