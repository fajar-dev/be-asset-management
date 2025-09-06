import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  Version,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ResponseCategoryDto } from './dto/response-category.dto';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Serialize } from '../../common/interceptor/serialize.interceptor';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post()
  // @Serialize(ResponseCategoryDto)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return new ApiResponse(
      'category created successfully',
      await this.categoriesService.create(createCategoryDto),
    );
  }
}
