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
    @Query('subCategoryId') subCategoryId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return new ApiResponse(
      'Assets retrieved successfully',
      await this.assetService.paginate({
        page,
        limit,
        search,
        subCategoryId,
        categoryId,
        status,
        employeeId,
        locationId
      }),
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
    'Note for asset fetched successfully',
    await this.assetService.findOne(uuid),
    );
  }

  @Get(':code/by-code')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  async findOneByCode(
    @Param('code', new DefaultValuePipe('')) code: string,
  ) {
    return new ApiResponse(
    'Note for asset fetched successfully',
    await this.assetService.findOneByCode(code),
    );
  }
}
