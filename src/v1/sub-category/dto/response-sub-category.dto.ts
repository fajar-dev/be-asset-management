import { Expose, Type } from 'class-transformer';
import { DataType } from '../../asset-property/enum/asset-property.enum';

class SubCategoryCategoryDto {
  @Expose({ name: 'categoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  hasLocation: boolean;

  @Expose()
  hasMaintenance: boolean;

  @Expose()
  hasHolder: boolean;
}

class SubCategoryAssetPropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: DataType;
}

export class ResponseSubCategoryDto {
  @Expose({ name: 'subCategoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  level: number;

  @Expose()
  labels: string[] | null;

  @Expose()
  @Type(() => SubCategoryCategoryDto)
  category: SubCategoryCategoryDto;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  parent: ResponseSubCategoryDto | null;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  children: ResponseSubCategoryDto[];

  @Expose()
  @Type(() => SubCategoryAssetPropertyDto)
  assetProperties: SubCategoryAssetPropertyDto[];
}