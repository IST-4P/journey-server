import { GetBlogRequestDTO, GetManyBlogsRequestDTO } from '@domain/blog';
import { IsPublic } from '@hacmieu-journey/nestjs';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  // private readonly logger = new Logger(BlogController.name);

  constructor(private readonly blogService: BlogService) {}

  @Get()
  @IsPublic()
  getManyBlogs(@Query() query: GetManyBlogsRequestDTO) {
    return this.blogService.getManyBlogs(query);
  }

  @Get(':id')
  @IsPublic()
  getBlog(@Param() query: GetBlogRequestDTO) {
    return this.blogService.getBlog(query);
  }
}
