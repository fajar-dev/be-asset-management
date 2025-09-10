import { IsString, IsNotEmpty, ValidateNested, IsArray, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { SubCategory } from 'src/v1/sub-category/entities/sub-category.entity';
import { IsExist } from 'src/common/validators/is-exist.decorator';
import { ValidatePropertiesBySubCategory } from 'src/common/validators/validate-properties-by-subcategory.decorator';

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

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  @ValidatePropertiesBySubCategory('subCategoryId', {
    message: 'Properties tidak sesuai dengan definisi subCategory',
  })
  properties: CreateAssetPropertyValueDto[];
}
