import { Expose, Type } from 'class-transformer';
import { ResponseSubCategoryDto } from '../../sub-category/dto/response-sub-category.dto';

export class ResponseAssetPropertyValueDto {
  @Expose()
  propertyId: string; // bisa tetap ada kalau mau identifikasi

  @Expose()
  name: string;

  @Expose()
  dataType: string;

  @Expose()
  value: string | number;
}

export class ResponseAssetDto {
  @Expose({ name: 'assetUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description?: string;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  subCategory: ResponseSubCategoryDto;

  @Expose()
  @Type(() => ResponseAssetPropertyValueDto)
  properties: ResponseAssetPropertyValueDto[];
}
