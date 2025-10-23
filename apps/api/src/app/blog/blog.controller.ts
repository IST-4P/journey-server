import { GetBlogRequestDTO, GetManyBlogsRequestDTO } from '@domain/blog';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  // private readonly logger = new Logger(BlogController.name);

  constructor(private readonly blogService: BlogService) {}

  @Get()
  getManyBlogs(@Query() query: GetManyBlogsRequestDTO) {
    return this.blogService.getManyBlogs(query);
  }

  @Get(':id')
  getBlog(@Param() query: GetBlogRequestDTO) {
    return this.blogService.getBlog(query);
  }
}
