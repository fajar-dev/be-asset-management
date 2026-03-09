import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { AssetHolderService } from '../asset-holder/asset-holder.service';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from './entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { PreSignedUrl } from '../../common/decorator/presigned-url.decorator';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { ResponseUserAssetDto } from './dto/response-user-asset.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly assetHolderService: AssetHolderService,
  ) {}

  @Get('/active')
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' },
    { originalKey: 'asset.imagePath', urlKey: 'asset.imageUrl' }
  ])
  @Serialize(ResponseUserAssetDto)
  @UseInterceptors(SerializeV2Interceptor)
  async getMyActiveAssets(
    @User() user: UserEntity,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (!user.employeeId) {
      return new ApiResponse('User is not associated with an employee', []);
    }
    return new ApiResponse(
      'Active assets retrieved successfully',
      await this.assetHolderService.paginateByEmployee(user.employeeId, { page, limit, status: 'active' }),
    );
  }

  @Get('/history')
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' },
    { originalKey: 'asset.imagePath', urlKey: 'asset.imageUrl' }
  ])
  @Serialize(ResponseUserAssetDto)
  @UseInterceptors(SerializeV2Interceptor)
  async getMyAssetHistory(
    @User() user: UserEntity,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (!user.employeeId) {
      return new ApiResponse('User is not associated with an employee', []);
    }
    return new ApiResponse(
      'Asset history retrieved successfully',
      await this.assetHolderService.paginateByEmployee(user.employeeId, { page, limit, status: 'history' }),
    );
  }
}
