import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe, Put } from '@nestjs/common';
import { AssetPropertyService } from './asset-property.service';
import { CreateAssetPropertyDto } from './dto/create-asset-property.dto';
import { UpdateAssetPropertyDto } from './dto/update-asset-property.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ResponseAssetPropertyDto } from './dto/response-asset-property.dto';
import { User } from '../../common/decorator/auth-user.decorator';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User as UserEntity } from '../user/entities/user.entity';

@Controller()
export class AssetPropertyController {
  constructor(private readonly assetPropertyService: AssetPropertyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseAssetPropertyDto)
  async create(
    @Param('subCategoryUuid', new ParseUUIDPipe()) subCategoryUuid: string,
    @Body() createAssetPropertyDto: CreateAssetPropertyDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Asset Property created successfully',
      await this.assetPropertyService.create(user.id, subCategoryUuid, createAssetPropertyDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetPropertyDto)
  async findAll(
    @Param('subCategoryUuid', new ParseUUIDPipe()) subCategoryUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Asset Properties for sub category retrieved successfully',
      await this.assetPropertyService.paginate({ page, limit, search, subCategoryUuid }),
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetPropertyDto)
  async findOne(
    @Param('subCategoryUuid', new ParseUUIDPipe()) subCategoryUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Asset Property for sub category fetched successfully',
      await this.assetPropertyService.findOne(subCategoryUuid, uuid),
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetPropertyDto)
  async update(
    @Param('subCategoryUuid', new ParseUUIDPipe()) subCategoryUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
    @Body() updateAssetPropertyDto: UpdateAssetPropertyDto,
  ) {
    return new ApiResponse(
      'Asset Property for sub category updated successfully',
      await this.assetPropertyService.update(subCategoryUuid, uuid, user.id, updateAssetPropertyDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('subCategoryUuid', new ParseUUIDPipe()) subCategoryUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.assetPropertyService.remove(subCategoryUuid, uuid, user.id);
    return new ApiResponse('Asset Property for sub category removed successfully');
  }
}
