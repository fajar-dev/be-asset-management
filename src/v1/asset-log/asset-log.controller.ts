import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { AssetLogService } from './asset-log.service';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ResponseAssetLogDto } from './dto/response-asset-log.dto';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class AssetLogController {
  constructor(
      private readonly assetLogService: AssetLogService
  ) {}

  @Get()
  @Serialize(ResponseAssetLogDto)
  async findAll(@Param('assetUuid', new ParseUUIDPipe()) assetUuid: string) {
    return new ApiResponse(
      'Asset logs retrieved successfully',
      await this.assetLogService.findAll(assetUuid)
    );
  }
}
