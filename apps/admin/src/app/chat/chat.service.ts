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
  ): Promise<ChatProto.GetManyConversationsWithUserInformation> {
    const conversations = await lastValueFrom(
      this.chatService.getManyConversations(data)
    );
    const userIds = conversations.conversations.map((c) => c.userId);
    const usersResponse = await lastValueFrom(
      this.userService.getFullNameAndAvatar({
        userIds,
      })
    );
    const result = {
      conversations: usersResponse.users.map((item, index) => {
        return {
          userId: item.userId,
          fullName: item.fullName,
          avatarUrl: item.avatarUrl,
          lastMessage: conversations.conversations[index].lastMessage,
          lastMessageAt: conversations.conversations[index].lastMessageAt,
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

  async getManyComplaints(
    data: ChatProto.GetManyComplaintsRequest
  ): Promise<ChatProto.GetManyComplaintsWithUserInformation> {
    const complaint = await lastValueFrom(
      this.chatService.getManyComplaints(data)
    );
    const userIds = complaint.complaints.map((c) => c.userId);
    const usersResponse = await lastValueFrom(
      this.userService.getFullNameAndAvatar({
        userIds,
      })
    );
    const result = {
      complaints: usersResponse.users.map((item, index) => {
        return {
          complaintId: complaint.complaints[index].complaintId,
          userId: item.userId,
          title: complaint.complaints[index].title,
          status: complaint.complaints[index].status,
          fullName: item.fullName,
          avatarUrl: item.avatarUrl,
          lastMessage: complaint.complaints[index].lastMessage,
          lastMessageAt: complaint.complaints[index].lastMessageAt,
          createdAt: complaint.complaints[index].createdAt,
        };
      }),
      page: complaint.page,
      limit: complaint.limit,
      totalItems: complaint.totalItems,
      totalPages: complaint.totalPages,
    };
    return result;
  }

  getManyComplaintMessages(
    data: ChatProto.GetManyComplaintMessagesRequest
  ): Promise<ChatProto.GetManyComplaintMessagesResponse> {
    return lastValueFrom(this.chatService.getManyComplaintMessages(data));
  }
}
