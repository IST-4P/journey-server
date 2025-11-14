import {
  CreateComplaintMessageRequest,
  CreateComplaintRequest,
  GetManyComplaintMessagesRequest,
  GetManyComplaintsRequest,
  UpdateComplaintStatusRequest,
} from '@domain/chat';
import { Injectable } from '@nestjs/common';
import { ComplaintNotFoundException } from './complaint.error';
import { ComplaintRepository } from './complaint.repo';

@Injectable()
export class ComplaintService {
  constructor(private readonly complaintRepository: ComplaintRepository) {}

  async getManyComplaints(data: GetManyComplaintsRequest) {
    const complaints = await this.complaintRepository.getManyComplaints(data);
    if (complaints.complaints.length === 0) {
      throw ComplaintNotFoundException;
    }
    return complaints;
  }

  createComplaint(data: CreateComplaintRequest) {
    return this.complaintRepository.createComplaint(data);
  }

  updateComplaintStatus(data: UpdateComplaintStatusRequest) {
    return this.complaintRepository.updateComplaintStatus(data);
  }

  async getManyComplaintMessages(data: GetManyComplaintMessagesRequest) {
    const complaintMessages =
      await this.complaintRepository.getManyComplaintMessages(data);
    if (complaintMessages.complaintMessages.length === 0) {
      throw ComplaintNotFoundException;
    }
    return complaintMessages;
  }

  createComplaintMessage(data: CreateComplaintMessageRequest) {
    return this.complaintRepository.createComplaintMessage(data);
  }
}
