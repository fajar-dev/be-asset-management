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
  Query,
  DefaultValuePipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { ResponseCategoryDto } from './dto/response-category.dto';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Serialize } from '../../common/interceptor/serialize.interceptor';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService
  ) {}
  
  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseCategoryDto)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return new ApiResponse(
      'category created successfully',
      await this.categoryService.create(createCategoryDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Categories retrieved successfully',
      await this.categoryService.paginate({ page, limit, search }),
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Friend fetched successfully',
      await this.categoryService.findOne(uuid),
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return new ApiResponse(
      'Category updated successfully',
      await this.categoryService.update(uuid, updateCategoryDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    await this.categoryService.remove(uuid);
    return new ApiResponse('category removed successfully');
  }
}
