import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, Query, Put } from '@nestjs/common';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { CreateAssetMaintenanceDto } from './dto/create-asset-maintenance.dto';
import { UpdateAssetMaintenanceDto } from './dto/update-asset-maintenance.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { User } from '../../common/decorator/auth-user.decorator';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseAssetMaintenanceDto } from './dto/response-asset-maintenance.dto';

@Controller()
export class AssetMaintenanceController {
  constructor(private readonly assetMaintenanceService: AssetMaintenanceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseAssetMaintenanceDto)
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() createAssetMaintenanceDto: CreateAssetMaintenanceDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Maintenance asset created successfully',
      await this.assetMaintenanceService.create(user.id, assetUuid, createAssetMaintenanceDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetMaintenanceDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Maintenances for asset retrieved successfully',
      await this.assetMaintenanceService.paginate({ page, limit, search, assetUuid }),
    );
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetMaintenanceDto)
  async findOne(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Asset Property for sub category fetched successfully',
      await this.assetMaintenanceService.findOne(assetUuid, uuid),
    );
  }
  
  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetMaintenanceDto)
  async update(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
    @Body() updateAssetMaintenanceDto: UpdateAssetMaintenanceDto,
  ) {
    return new ApiResponse(
      'Maintenances for asset updated successfully',
      await this.assetMaintenanceService.update(assetUuid, uuid, user.id, updateAssetMaintenanceDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.assetMaintenanceService.remove(assetUuid, uuid, user.id);
    return new ApiResponse('Maintenances for asset removed successfully');
  }
}
