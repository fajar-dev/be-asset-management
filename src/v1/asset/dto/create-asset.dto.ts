import { IsString, IsNotEmpty, ValidateNested, IsArray, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../..//common/validators/is-exist.decorator';
import { ValidatePropertiesBySubCategory } from '../../../common/validators/validate-properties-by-subcategory.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';

export class CreateAssetPropertyValueDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  value: string | number;
}

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsExist, [SubCategory, 'subCategoryUuid'])
  subCategoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  brand: string;

  @IsOptional()
  model: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  @ValidatePropertiesBySubCategory('subCategoryId', {
    message: 'Properties do not match the subCategory definition',
  })
  properties: CreateAssetPropertyValueDto[];
}
