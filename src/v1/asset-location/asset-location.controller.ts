import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AssetLocationService } from './asset-location.service';
import { CreateAssetLocationDto } from './dto/create-asset-location.dto';
import { UpdateAssetLocationDto } from './dto/update-asset-location.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ResponseAssetLocationDto } from './dto/response-asset-location.dto';
import { Serialize } from 'src/common/interceptor/serialize.interceptor';
import { User } from 'src/common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from 'src/common/utils/ApiResponse';

@Controller()
export class AssetLocationController {
  constructor(private readonly assetLocationService: AssetLocationService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseAssetLocationDto)
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() createAssetLocationDto: CreateAssetLocationDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Location asset created successfully',
      await this.assetLocationService.create(user.id, assetUuid, createAssetLocationDto),
    );
  }
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetLocationDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Location for asset retrieved successfully',
      await this.assetLocationService.paginate({ page, limit, search, assetUuid }),
    );
  }
}
