import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { AssetLabelService } from './asset-label.service';
import { CreateAssetLabelDto } from './dto/create-asset-label.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { ResponseAssetLabelDto } from './dto/response-asset-label.dto';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../user/enum/role.enum';

@Controller()
export class AssetLabelController {
  constructor(private readonly assetLabelService: AssetLabelService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Serialize(ResponseAssetLabelDto)
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() createAssetLabelDto: CreateAssetLabelDto,
  ) {
    return new ApiResponse(
      'Label for asset created successfully',
      await this.assetLabelService.create(assetUuid, createAssetLabelDto),
    );
  }

  @Get('check')
  async checkLabel(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('key') key: string,
    @Query('value') value: string,
  ) {
    return new ApiResponse(
      'Label availability checked successfully',
      await this.assetLabelService.checkLabel(assetUuid, key, value),
    );
  }

  @Get()
  @Serialize(ResponseAssetLabelDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
  ) {
    return new ApiResponse(
      'Labels for asset retrieved successfully',
      await this.assetLabelService.findAll(assetUuid),
    );
  }

}

