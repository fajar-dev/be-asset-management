import { Expose, Type } from 'class-transformer';
import { ResponseCategoryDto } from '../../category/dto/response-category.dto';
import { ResponseAssetPropertyDto } from '../../asset-property/dto/response-asset-property.dto';

export class ResponseSubCategoryDto {
  @Expose({ name: 'subCategoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  level: number;

  @Expose()
  @Type(() => ResponseCategoryDto)
  category: ResponseCategoryDto;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  parent: ResponseSubCategoryDto | null;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  children: ResponseSubCategoryDto[];

  @Expose()
  @Type(() => ResponseAssetPropertyDto)
  assetProperties: ResponseAssetPropertyDto[];
}