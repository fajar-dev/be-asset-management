import { IsString, IsNotEmpty, ValidateNested, IsArray, Validate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../..//common/validators/is-exist.decorator';
import { ValidatePropertiesBySubCategory } from '../../../common/validators/validate-properties-by-subcategory.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';
import { IsUniqueExceptSelf } from '../../../common/validators/is-unique-except-self.decorator';
import { Asset } from '../entities/asset.entity';

export enum AssetStatus {
  ACTIVE = 'active',
  IN_REPAIR = 'in repair',
  DISPOSED = 'disposed',
}

export class CreateAssetPropertyValueDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  value: string | number;
}

export class UpdateAssetDto {

  @IsString()
  @IsNotEmpty()
  @Validate(IsExist, [SubCategory, 'subCategoryUuid'])
  subCategoryId: string;

  @IsString()
  @IsNotEmpty()
  @IsUniqueExceptSelf('assets', 'code', 'asset_uuid')
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string | null;

  @IsOptional()
  brand: string | null;

  @IsOptional()
  model: string | null;

  @IsEnum(AssetStatus, {
    message: 'status must be one of: active, in repair, disposed',
  })
  @IsNotEmpty()
  status: AssetStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  @ValidatePropertiesBySubCategory('subCategoryId', {
    message: 'Properties do not match the subCategory definition',
  })
  properties: CreateAssetPropertyValueDto[];

  image?: Express.Multer.File;
}
