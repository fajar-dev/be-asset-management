import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, ParseUUIDPipe, Put } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseSubCategoryDto } from './dto/response-sub-category.dto';

@Controller()
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseSubCategoryDto)
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Sub category created successfully',
      await this.subCategoryService.create(user.id, createSubCategoryDto),
    );
  }
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseSubCategoryDto)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Sub categories retrieved successfully',
      await this.subCategoryService.paginate({ page, limit, search }),
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseSubCategoryDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Sub category fetched successfully',
      await this.subCategoryService.findOne(uuid),
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseSubCategoryDto)
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return new ApiResponse(
      'Sub category updated successfully',
      await this.subCategoryService.update(uuid, user.id, updateSubCategoryDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.subCategoryService.remove(uuid, user.id);
    return new ApiResponse('Sub category removed successfully');
  }
}
