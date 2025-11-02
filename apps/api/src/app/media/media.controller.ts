import { IsPublic } from '@hacmieu-journey/nestjs';
import { Body, Controller, Post } from '@nestjs/common';
import { PresignedUploadFileBodyDTO } from './media.dto';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presigned')
  @IsPublic()
  async createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body);
  }
}
