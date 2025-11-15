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

  async getManyConversations(data: ChatProto.GetManyConversationsRequest) {
    const conversations = await lastValueFrom(
      this.chatService.getManyConversations(data)
    );
    const usersResponse = await lastValueFrom(
      this.userService.getFullNameAndAvatar({
        userIds: conversations.conversations,
      })
    );
    const result = {
      conversations: usersResponse.users || [],
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
}
