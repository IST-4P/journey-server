import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetBlogRequestDTO, GetManyBlogsRequestDTO } from './blog.dto';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  // private readonly logger = new Logger(BlogController.name);

  constructor(private readonly blogService: BlogService) {}

  @Get()
  getManyBlogs(@Query() query: GetManyBlogsRequestDTO) {
    return this.blogService.getManyBlogs(query);
  }

  @Get(':blogId')
  getBlog(@Param() query: GetBlogRequestDTO) {
    return this.blogService.getBlog(query);
  }
}
