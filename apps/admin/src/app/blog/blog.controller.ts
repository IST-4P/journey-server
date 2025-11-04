import {
  CreateBlogRequestDTO,
  DeleteBlogRequestDTO,
  GetBlogRequestDTO,
  GetManyBlogsRequestDTO,
  UpdateBlogRequestDTO,
} from '@domain/blog';
import { Auth, AuthType } from '@hacmieu-journey/nestjs';
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
  @Auth([AuthType.Admin])
  getManyBlogs(@Query() query: GetManyBlogsRequestDTO) {
    return this.blogService.getManyBlogs(query);
  }

  @Get(':id')
  @Auth([AuthType.Admin])
  getBlog(@Param() query: GetBlogRequestDTO) {
    return this.blogService.getBlog(query);
  }

  @Post()
  @Auth([AuthType.Admin])
  createBlog(@Body() body: CreateBlogRequestDTO) {
    return this.blogService.createBlog(body);
  }

  @Put(':id')
  @Auth([AuthType.Admin])
  updateBlog(@Param('id') id: string, @Body() body: UpdateBlogRequestDTO) {
    return this.blogService.updateBlog({ ...body, id });
  }

  @Delete(':id')
  @Auth([AuthType.Admin])
  deleteBlog(@Param() params: DeleteBlogRequestDTO) {
    return this.blogService.deleteBlog(params);
  }
}
