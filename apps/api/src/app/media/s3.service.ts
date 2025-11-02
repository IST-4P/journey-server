import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mime from 'mime-types';

@Injectable()
export class S3Service {
  private S3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.S3Client = new S3Client({
      endpoint: this.configService.getOrThrow<string>(
        'DIGITAL_OCEAN_END_POINT'
      ),
      region: this.configService.getOrThrow<string>(
        'DIGITAL_OCEAN_SPACES_REGION'
      ),
      credentials: {
        secretAccessKey: this.configService.getOrThrow<string>(
          'DIGITAL_OCEAN_SPACES_SECRET'
        ),
        accessKeyId: this.configService.getOrThrow<string>(
          'DIGITAL_OCEAN_SPACES_KEY'
        ),
      },
    });
  }

  createPresignedUrlWithClient = (filename: string) => {
    const contentType = mime.lookup(filename) || 'application/octet-stream';
    const command = new PutObjectCommand({
      Bucket: 'IMAGES',
      Key: 'images/' + filename,
      ACL: 'public-read',
      ContentType: contentType,
    });
    return getSignedUrl(this.S3Client, command, { expiresIn: 3600 });
  };
}
