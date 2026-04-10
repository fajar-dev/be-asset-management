import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AssetStatusService } from './asset-status.service';
import { CreateAssetStatusDto } from './dto/create-asset-status.dto';
import { ResponseAssetStatusDto } from '../asset/dto/response-asset.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class AssetStatusController {
  constructor(private readonly assetStatusService: AssetStatusService) {}

  @Post()
  @Serialize(ResponseAssetStatusDto)
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() createAssetStatusDto: CreateAssetStatusDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Asset status updated successfully',
      await this.assetStatusService.create(user.id, assetUuid, createAssetStatusDto),
    );
  }

  @Get()
  @Serialize(ResponseAssetStatusDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Statuses for asset retrieved successfully',
      await this.assetStatusService.paginate({ page, limit, search, assetUuid }),
    );
  }
}
