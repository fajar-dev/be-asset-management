import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetStatusService } from './asset-status.service';
import { CreateAssetStatusDto } from './dto/create-asset-status.dto';
import { ResponseAssetStatusDto } from './dto/response-asset-status.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { PreSignedUrl } from '../../common/decorator/presigned-url.decorator';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class AssetStatusController {
  constructor(private readonly assetStatusService: AssetStatusService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 3))
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    const createAssetStatusDto: CreateAssetStatusDto = { ...body, attachments };
    return new ApiResponse(
      'Asset status updated successfully',
      await this.assetStatusService.create(user.id, assetUuid, createAssetStatusDto),
    );
  }

  @Get()
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' }
  ])
  @Serialize(ResponseAssetStatusDto)
  @UseInterceptors(SerializeV2Interceptor)
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
