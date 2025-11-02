import { Injectable } from '@nestjs/common';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUploadFileBodyType } from './media.model';
import { S3Service } from './s3.service';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  generateRandomFileName = (fileName: string) => {
    const ext = path.extname(fileName);
    return `${uuidv4()}${ext}`;
  };

  async getPresignedUrl(body: PresignedUploadFileBodyType) {
    const randomFilename = this.generateRandomFileName(body.filename);
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(
      randomFilename
    );
    const url = presignedUrl.split('?')[0];
    console.log(JSON.stringify({ presignedUrl, url }));
    return {
      presignedUrl,
      url,
    };
  }
}
