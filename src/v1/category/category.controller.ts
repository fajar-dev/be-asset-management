import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { ResponseCategoryDto } from './dto/response-category.dto';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { SubCategoryService } from '../sub-category/sub-category.service';
import { ResponseSubCategoryDto } from '../sub-category/dto/response-sub-category.dto';

@Controller()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService
  ) {}
  
  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseCategoryDto)
  async create(
    @User() user: UserEntity,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return new ApiResponse(
      'category created successfully',
      await this.categoryService.create(user.id, createCategoryDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async findAll(
    @Query('all', new DefaultValuePipe(false)) all: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    let data;
    if (all) {
      data = await this.categoryService.findAll( search );
    } else {
      data = await this.categoryService.paginate({ page, limit, search });
    }
    return new ApiResponse(
      all ? 'All categories retrieved successfully' : 'Categories retrieved successfully',
      data,
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Category fetched successfully',
      await this.categoryService.findOne(uuid),
    );
  }

  @Get(':uuid/sub-category')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseSubCategoryDto)
  async findSubCategory(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Sub Category by category retrieved successfully',
      await this.subCategoryService.findAllByCategory(uuid),
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseCategoryDto)
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return new ApiResponse(
      'Category updated successfully',
      await this.categoryService.update(uuid, user.id, updateCategoryDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.categoryService.remove(uuid, user.id);
    return new ApiResponse('Category removed successfully');
  }
}
