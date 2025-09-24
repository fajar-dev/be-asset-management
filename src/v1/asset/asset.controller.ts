import { Controller, Post, Body, UseGuards, Get, Param, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe, Put, Delete, UseInterceptors, UploadedFile} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseAssetDto } from './dto/response-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PreSignedUrl } from 'src/common/decorator/presigned-url.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadValidator } from '../../common/validators/image-upload.validator';
import { parseProperties } from '../../common/helpers/parse-properties.helper';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';

@Controller()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFile(ImageUploadValidator) image: Express.Multer.File,
  ) {
    const createAssetDto: CreateAssetDto = {
      ...body,
      properties: parseProperties(body.properties),
      image,
    };

    return new ApiResponse(
      'Asset Property created successfully',  
      await this.assetService.create(user.id, createAssetDto)
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFile(ImageUploadValidator) image: Express.Multer.File,
  ) {
    const updateAssetDto: UpdateAssetDto = {
      ...body,
      properties: parseProperties(body.properties),
      image,
    };

    return new ApiResponse(
      'Asset Property updated successfully',
      await this.assetService.update(uuid, user.id, updateAssetDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseAssetDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('subCategoryId') subCategoryId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('locationId') locationId?: string,
  ) {
    const paginated = await this.assetService.paginate({
      page,
      limit,
      search,
      subCategoryId,
      categoryId,
      status,
      employeeId,
      locationId,
    });

    return new ApiResponse('Assets retrieved successfully', paginated);
  }


  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
    'Note for asset fetched successfully',
    await this.assetService.findOne(uuid),
    );
  }

  @Get(':code/by-code')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseAssetDto)
  async findOneByCode(
    @Param('code', new DefaultValuePipe('')) code: string,
  ) {
    return new ApiResponse(
    'Note for asset fetched successfully',
    await this.assetService.findOneByCode(code),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.assetService.remove(uuid, user.id);
    return new ApiResponse('Location removed successfully');
  }
}
