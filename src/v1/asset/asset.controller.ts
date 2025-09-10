import { Controller, Post, Body, UseGuards, Get, Param, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseAssetDto } from './dto/response-asset.dto';

@Controller()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseAssetDto)
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Asset Property created successfully',
      await this.assetService.create(user.id, createAssetDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
    // @Query('subCategoryUuid', new DefaultValuePipe(null), ParseUUIDPipe) subCategoryUuid?: string,
    // @Query('categoryUuid', new DefaultValuePipe(null), ParseUUIDPipe) categoryUuid?: string,
  ) {
    return new ApiResponse(
      'Assets retrieved successfully',
      await this.assetService.paginate({ page, limit, search,  }),
    );
  }

}
