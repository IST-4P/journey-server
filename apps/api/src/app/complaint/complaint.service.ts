import { ChatProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ComplaintService implements OnModuleInit {
  private chatService!: ChatProto.ChatServiceClient;

  constructor(
    @Inject(ChatProto.CHAT_PACKAGE_NAME)
    private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatProto.ChatServiceClient>(
      ChatProto.CHAT_SERVICE_NAME
    );
  }

  getManyComplaints(
    data: ChatProto.GetManyComplaintsRequest
  ): Promise<ChatProto.GetManyComplaintsResponse> {
    return lastValueFrom(this.chatService.getManyComplaints(data));
  }

  createComplaint(
    data: ChatProto.CreateComplaintRequest
  ): Promise<ChatProto.GetComplaintResponse> {
    return lastValueFrom(this.chatService.createComplaint(data));
  }

  getManyComplaintMessages(
    data: ChatProto.GetManyComplaintMessagesRequest
  ): Promise<ChatProto.GetManyComplaintMessagesResponse> {
    return lastValueFrom(this.chatService.getManyComplaintMessages(data));
  }

  createComplaintMessage(
    data: ChatProto.CreateComplaintMessageRequest
  ): Promise<ChatProto.ComplaintMessage> {
    return lastValueFrom(this.chatService.createComplaintMessage(data));
  }
}
