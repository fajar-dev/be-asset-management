import { BadRequestException, Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, UseGuards, UploadedFiles, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AssetHolderService } from './asset-holder.service';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { PreSignedUrl } from '../../common/decorator/presigned-url.decorator';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { ResponseAssetHolderDto } from './dto/response-asset-holder.dto';
import { assignedAssetHolderDto } from './dto/assigned-asset-holder.dto';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { returnedAssetHolderDto } from './dto/returned-asset-holder.dto';
import { RequestAssetHolderDto } from './dto/request-asset-holder.dto';
import { ReturnRequestAssetHolderDto } from './dto/return-request-asset-holder.dto';
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
  @PreSignedUrl([
    { originalKey: 'attachmentPaths', urlKey: 'attachmentUrls' }
  ])
  @Serialize(ResponseAssetHolderDto)
  @UseInterceptors(SerializeV2Interceptor)
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
  @UseInterceptors(FilesInterceptor('attachments', 3))
  async assigned(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    const assignedAssetHolderDto: assignedAssetHolderDto = {
      ...body,
      assignedAt: body.assignedAt ? new Date(body.assignedAt) : undefined,
      attachments 
    };
    assignedAssetHolderDto.attachments = attachments;
    await this.assetHolderService.assign(user.id, assetUuid, assignedAssetHolderDto);
    return new ApiResponse('Holder asset assigned successfully');
  }
  
  @Post('request')
  @UseInterceptors(FileInterceptor('image'))
  async request(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Body() body: RequestAssetHolderDto,
    @User() user: UserEntity,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    if (!user.employeeId) {
      throw new BadRequestException('User is not associated with an employee');
    }

    const watermarkedImage = await this.assetHolderService.watermarkImage(image);

    const assignDto: assignedAssetHolderDto = {
      assignedAt: new Date(),
      purpose: body.purpose || 'Peminjaman Pribadi',
      employeeId: user.employeeId,
      attachments: [watermarkedImage],
      isRequest: true,
    };

    await this.assetHolderService.assign(
      user.id,
      assetUuid,
      assignDto,
    );
    return new ApiResponse('Holder asset requested successfully');
  }

  @Post(':uuid')
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('attachments', 3))
  async returned(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    const returnedAssetHolderDto: returnedAssetHolderDto = { 
       ...body, 
       returnedAt: body.returnedAt ? new Date(body.returnedAt) : undefined,
       attachments 
    };
    returnedAssetHolderDto.attachments = attachments;
    await this.assetHolderService.return(user.id, assetUuid, uuid, returnedAssetHolderDto);
    return new ApiResponse('Holder asset returned successfully');
  }

  @Post(':uuid/return-request')
  @UseInterceptors(FileInterceptor('image'))
  async returnRequest(
    @Param('assetUuid', new ParseUUIDPipe()) assetUuid: string,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() body: ReturnRequestAssetHolderDto,
    @User() user: UserEntity,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    if (!user.employeeId) {
      throw new BadRequestException('User is not associated with an employee');
    }

    const watermarkedImage = await this.assetHolderService.watermarkImage(image);

    const returnDto: returnedAssetHolderDto = {
      returnedAt: new Date(),
      attachments: [watermarkedImage],
    };

    await this.assetHolderService.return(
      user.id,
      assetUuid,
      uuid,
      returnDto,
      user.employeeId,
    );
    return new ApiResponse('Holder asset returned successfully');
  }
}
