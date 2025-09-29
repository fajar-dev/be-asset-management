import { BadRequestException, Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AssetHolderService } from './asset-holder.service';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ResponseAssetHolderDto } from './dto/response-asset-holder.dto';
import { assignedAssetHolderDto } from './dto/assigned-asset-holder.dto';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { returnedAssetHolderDto } from './dto/returned-asset-holder.dto';
import { CategoryGuard } from '../category/guards/category.guard';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../user/enum/role.enum';

@Controller()
@UseGuards(CategoryGuard)
export class AssetHolderController {
  constructor(
    private readonly assetHolderService: AssetHolderService
  ) {}
  
  @Get()
  @Serialize(ResponseAssetHolderDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Holders for asset retrieved successfully',
      await this.assetHolderService.paginate({ page, limit, search, assetUuid }),
    );
  }
      
  @Post()
  @Roles(Role.ADMIN)
  async assigned(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() assignedAssetHolderDto: assignedAssetHolderDto,
    @User() user: UserEntity,
  ) {
    const assign = await this.assetHolderService.assign(user.id, assetUuid, assignedAssetHolderDto)
    if(assign){
      return new ApiResponse(
        'Holder asset assigned successfully'
      );
    }
    throw new BadRequestException('The asset is currently on loan or the asset status is inactive.');
  }
  

  @Post(':uuid')
  @Roles(Role.ADMIN)
  async returned(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() returnedAssetHolderDto: returnedAssetHolderDto,
    @User() user: UserEntity,
  ) {
    const assign = await this.assetHolderService.return(user.id, assetUuid, uuid, returnedAssetHolderDto)
    if(assign){
      return new ApiResponse(
        'Holder asset returned successfully'
      );
    }
    throw new BadRequestException('The asset is currently on loan or the asset status is inactive.');
  }
}
