import { BlogProto } from '@hacmieu-journey/grpc';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BlogService implements OnModuleInit {
  private blogService!: BlogProto.BlogServiceClient;

  constructor(
    @Inject(BlogProto.BLOG_PACKAGE_NAME) private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.blogService = this.client.getService<BlogProto.BlogServiceClient>(
      BlogProto.BLOG_SERVICE_NAME
    );
  }

  getBlog(data: BlogProto.GetBlogRequest): Promise<BlogProto.GetBlogResponse> {
    return lastValueFrom(this.blogService.getBlog(data));
  }

  getManyBlogs(
    data: BlogProto.GetManyBlogsRequest
  ): Promise<BlogProto.GetManyBlogsResponse> {
    return lastValueFrom(this.blogService.getManyBlogs(data));
  }
}
