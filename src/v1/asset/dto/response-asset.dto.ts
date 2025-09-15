import { Expose, Transform, Type } from 'class-transformer';
import { ResponseSubCategoryDto } from '../../sub-category/dto/response-sub-category.dto';

export class ResponsePropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: string;
}

export class ResponseAssetPropertyValueDto {
  @Expose({ name: 'assetPropertyValueUuid' })
  id: string;

  @Expose()
  @Transform(({ obj }) => {
    switch (obj.property?.dataType) {
      case 'number':
        return obj.valueInt;
      case 'string':
        return obj.valueString;
      default:
        return null;
    }
  })
  value: string | number | null;

  @Expose()
  @Type(() => ResponsePropertyDto)
  property: ResponsePropertyDto;
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
  status: string;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  subCategory: ResponseSubCategoryDto;

  @Expose({ name: 'propertyValues' })
  @Type(() => ResponseAssetPropertyValueDto)
  properties: ResponseAssetPropertyValueDto[];
}
