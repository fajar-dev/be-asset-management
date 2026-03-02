import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { AssetLogService } from './asset-log.service';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ResponseAssetLogDto } from './dto/response-asset-log.dto';

@Controller('asset-log')
export class AssetLogController {
  constructor(
      private readonly assetLogService: AssetLogService
  ) {}

  @Get(':uuid')
  @Serialize(ResponseAssetLogDto)
  findAll(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.assetLogService.findAll(uuid);
  }
}
