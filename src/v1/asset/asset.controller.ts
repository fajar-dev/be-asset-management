import { Controller, Post, Body, UseGuards, Get, Param, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe, Put, Delete, UseInterceptors, UploadedFile, Res} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseAssetDto } from './dto/response-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PreSignedUrl } from '../../common/decorator/presigned-url.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadValidator } from '../../common/validators/image-upload.validator';
import { parseProperties } from '../../common/helpers/parse-properties.helper';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../user/enum/role.enum';
import type { Response } from 'express';
import { exportToExcel } from 'src/common/utils/excel-export.util';

@Controller()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @Roles(Role.ADMIN)
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

  @Get()
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
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
      startDate,
      endDate,
    });

    return new ApiResponse('Assets retrieved successfully', paginated);
  }

  @Get('export')
  async exportXLS(
    @Res() res: Response,
    @Query('subCategoryId') subCategoryId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const assets = await this.assetService.getAssetsForExport({
      subCategoryId,
      categoryId,
      status,
      employeeId,
      locationId,
      startDate,
      endDate,
    });

    await exportToExcel(res, {
      fileName: `assets_export_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Assets',
      columns: [
        { header: 'No', key: 'no', width: 5 },
        { header: 'ID', key: 'code', width: 10 },
        { header: 'Asset Name', key: 'name', width: 25 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Sub Category', key: 'subCategory', width: 20 },
        { header: 'Brand', key: 'brand', width: 15 },
        { header: 'Model', key: 'model', width: 15 },
        { header: 'Purchase Date', key: 'purchaseDate', width: 18 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'User', key: 'user', width: 15 },
        { header: 'Holder', key: 'holder', width: 25 },
        { header: 'Location', key: 'location', width: 25 },
        { header: 'Branch', key: 'branch', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
      ],
      data: assets,
      mapRow: (asset, index) => {
        const hasHolder = asset.subCategory?.category?.hasHolder;
        const hasLocation = asset.subCategory?.category?.hasLocation;

        const activeHolder = hasHolder
          ? (asset.holderRecords || []).find(h => !h.returnedAt && !h.deletedAt)
          : null;

        const lastLocation = hasLocation
          ? (asset.locationRecords || []).find(l => !l.deletedAt)?.location
          : null;

        return {
          no: index + 1,
          code: asset.code,
          name: asset.name,
          category: asset.subCategory?.category?.name ?? '-',
          subCategory: asset.subCategory?.name ?? '-',
          brand: asset.brand ?? '-',
          model: asset.model ?? '-',
          purchaseDate: asset.purchaseDate
            ? new Date(asset.purchaseDate).toISOString().split('T')[0]
            : '-',
          price: asset.price ?? '-',
          user: asset.user ?? '-',
          holder: activeHolder?.employee
            ? `${activeHolder.employee.idEmployee} - ${activeHolder.employee.fullName}`
            : '-',
          location: lastLocation?.name ?? '-',
          branch: lastLocation?.branch.name ?? '-',
          status: asset.status ?? '-',
        };
      },
    });
  }

  @Put(':uuid')
  @Roles(Role.ADMIN)
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

  @Get(':uuid')
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseAssetDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
    'Asset for asset fetched successfully',
    await this.assetService.findOne(uuid),
    );
  }

  @Get(':code/by-code')
  @PreSignedUrl([
    { originalKey: 'imagePath', urlKey: 'imageUrl' },
  ])
  @Serialize(ResponseAssetDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findOneByCode(
    @Param('code', new DefaultValuePipe('')) code: string,
  ) {
    return new ApiResponse(
    'Asset for asset fetched successfully',
    await this.assetService.findOneByCode(code),
    );
  }

  @Delete(':uuid')
  @Roles(Role.ADMIN)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.assetService.remove(uuid, user.id);
    return new ApiResponse('Asset removed successfully');
  }
}
