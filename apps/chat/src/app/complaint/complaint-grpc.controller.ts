import {
  CreateComplaintMessageRequest,
  CreateComplaintRequest,
  GetComplaintResponse,
  GetManyComplaintMessagesRequest,
  GetManyComplaintsRequest,
  GetManyComplaintsResponse,
  UpdateComplaintStatusRequest,
} from '@domain/chat';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ComplaintService } from './complaint.service';

@Controller()
export class ComplaintGrpcController {
  constructor(private readonly complaintService: ComplaintService) {}

  @GrpcMethod('ChatService', 'GetManyComplaints')
  getManyComplaints(
    data: GetManyComplaintsRequest
  ): Promise<GetManyComplaintsResponse> {
    return this.complaintService.getManyComplaints(data);
  }

  @GrpcMethod('ChatService', 'CreateComplaint')
  createComplaint(data: CreateComplaintRequest): Promise<GetComplaintResponse> {
    return this.complaintService.createComplaint(data);
  }

  @GrpcMethod('ChatService', 'UpdateComplaintStatus')
  updateComplaintStatus(
    data: UpdateComplaintStatusRequest
  ): Promise<GetComplaintResponse> {
    return this.complaintService.updateComplaintStatus(data);
  }

  @GrpcMethod('ChatService', 'GetManyComplaintMessages')
  getManyComplaintMessages(data: GetManyComplaintMessagesRequest) {
    return this.complaintService.getManyComplaintMessages(data);
  }

  @GrpcMethod('ChatService', 'CreateComplaintMessage')
  createComplaintMessage(data: CreateComplaintMessageRequest) {
    return this.complaintService.createComplaintMessage(data);
  }
}
