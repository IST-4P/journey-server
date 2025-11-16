import {
  CreateComplaintMessageRequestDTO,
  CreateComplaintRequestDTO,
  GetManyComplaintMessagesRequestDTO,
  GetManyComplaintsRequestDTO,
} from '@domain/chat';
import { ActiveUser } from '@hacmieu-journey/nestjs';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ComplaintService } from './complaint.service';

@Controller('complaint')
export class ComplaintController {
  // private readonly logger = new Logger(ComplaintController.name);

  constructor(private readonly complaintService: ComplaintService) {}
  @Get()
  getManyComplaints(
    @Query() query: Omit<GetManyComplaintsRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.complaintService.getManyComplaints({ ...query, userId });
  }

  @Post()
  createComplaint(
    @Body() body: Omit<CreateComplaintRequestDTO, 'userId'>,
    @ActiveUser('userId') userId: string
  ) {
    return this.complaintService.createComplaint({ ...body, userId });
  }
}

@Controller('complaint-message')
export class ComplaintMessageController {
  // private readonly logger = new Logger(ComplaintMessageController.name);
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  getManyComplaintMessages(@Query() query: GetManyComplaintMessagesRequestDTO) {
    return this.complaintService.getManyComplaintMessages(query);
  }

  @Post()
  createComplaintMessage(
    @Body() body: Omit<CreateComplaintMessageRequestDTO, 'senderId'>,
    @ActiveUser('userId') senderId: string
  ) {
    return this.complaintService.createComplaintMessage({ ...body, senderId });
  }
}
