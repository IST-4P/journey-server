import {
  CreateCategoryRequestDTO,
  DeleteCategoryRequestDTO,
  GetCategoryRequestDTO,
  GetManyCategoriesRequestDTO,
  UpdateCategoryRequestDTO,
} from '@domain/device';
import { IsPublic } from '@hacmieu-journey/nestjs';
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
import { DeviceService } from './device.service';

@Controller('category')
export class CategoryController {
  // private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @IsPublic()
  getManyCategories(@Query() query: GetManyCategoriesRequestDTO) {
    return this.deviceService.getManyCategories(query);
  }

  @Get(':categoryId')
  @IsPublic()
  getCategory(@Param() params: GetCategoryRequestDTO) {
    return this.deviceService.getCategory(params);
  }

  @Post()
  @IsPublic()
  createCategory(@Body() body: CreateCategoryRequestDTO) {
    return this.deviceService.createCategory(body);
  }

  @Put()
  updateCategory(@Body() body: UpdateCategoryRequestDTO) {
    return this.deviceService.updateCategory(body);
  }

  @Delete(':categoryId')
  deleteCategory(@Param() params: DeleteCategoryRequestDTO) {
    return this.deviceService.deleteCategory(params);
  }
}
