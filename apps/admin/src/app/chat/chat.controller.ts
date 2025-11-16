import {
  GetChatsRequestDTO,
  GetManyComplaintMessagesRequestDTO,
  GetManyComplaintsRequestDTO,
  GetManyConversationsRequestDTO,
  UpdateComplaintStatusRequestDTO,
} from '@domain/chat';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  // private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getManyConversations(
    @Query() query: Omit<GetManyConversationsRequestDTO, 'adminId'>,
    @ActiveUser('userId') adminId: string
  ) {
    return this.chatService.getManyConversations({ ...query, adminId });
  }

  @Get()
  getManyChats(
    @Query() query: Omit<GetChatsRequestDTO, 'fromUserId'>,
    @ActiveUser('userId') adminId: string
  ) {
    return this.chatService.getChats({ ...query, fromUserId: adminId });
  }
}

@Controller('complaint')
export class ComplaintController {
  // private readonly logger = new Logger(ComplaintController.name);
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getManyComplaints(@Query() query: GetManyComplaintsRequestDTO) {
    return this.chatService.getManyComplaints(query);
  }

  @Put()
  updateComplaintStatus(@Body() body: UpdateComplaintStatusRequestDTO) {
    return this.chatService.updateComplaintStatus(body);
  }
}

@Controller('complaint-message')
export class ComplaintMessageController {
  // private readonly logger = new Logger(ComplaintMessageController.name);
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getManyComplaintMessages(@Query() query: GetManyComplaintMessagesRequestDTO) {
    return this.chatService.getManyComplaintMessages(query);
  }
}
