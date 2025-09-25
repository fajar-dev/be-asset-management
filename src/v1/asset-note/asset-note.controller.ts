import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AssetNoteService } from './asset-note.service';
import { CreateAssetNoteDto } from './dto/create-asset-note.dto';
import { UpdateAssetNoteDto } from './dto/update-asset-note.dto';
import { User as UserEntity } from '../user/entities/user.entity';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { ResponseAssetNoteDto } from './dto/response-asset-note.dto';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../user/role.enum';

@Controller()
export class AssetNoteController {
  constructor(private readonly assetNoteService: AssetNoteService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Serialize(ResponseAssetNoteDto)
  async create(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() createAssetNoteDto: CreateAssetNoteDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'note for asset created successfully',
      await this.assetNoteService.create(user.id, assetUuid, createAssetNoteDto),
    );
  }
  
  @Get()
  @Serialize(ResponseAssetNoteDto)
  async findAll(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
    'Notes for asset retrieved successfully',
    await this.assetNoteService.paginate({ page, limit, search, assetUuid }),
    );
  }
  
  @Get(':uuid')
  @Serialize(ResponseAssetNoteDto)
  async findOne(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
    'Note for asset fetched successfully',
    await this.assetNoteService.findOne(assetUuid, uuid),
    );
  }
  
  @Put(':uuid')
  @Roles(Role.ADMIN)
  @Serialize(ResponseAssetNoteDto)
  async update(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  @Body() updateAssetNoteDto: UpdateAssetNoteDto,
  ) {
    return new ApiResponse(
    'Note for asset updated successfully',
    await this.assetNoteService.update(assetUuid, uuid, user.id, updateAssetNoteDto),
    );
  }

  @Delete(':uuid')
  @Roles(Role.ADMIN)
  async remove(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
  await this.assetNoteService.remove(assetUuid, uuid, user.id);
  return new ApiResponse('Note for asset removed successfully');
  }
}
