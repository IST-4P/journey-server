import {
  CreateBlogRequestDTO,
  DeleteBlogRequestDTO,
  GetBlogRequestDTO,
  GetManyBlogsRequestDTO,
  UpdateBlogRequestDTO,
} from '@domain/blog';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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

  @Post()
  createBlog(@Body() body: CreateBlogRequestDTO) {
    return this.blogService.createBlog(body);
  }

  @Put(':blogId')
  updateBlog(
    @Param('blogId') blogId: string,
    @Body() body: UpdateBlogRequestDTO
  ) {
    return this.blogService.updateBlog({ ...body, id: blogId });
  }

  @Delete(':blogId')
  deleteBlog(@Param() params: DeleteBlogRequestDTO) {
    return this.blogService.deleteBlog(params);
  }
}
