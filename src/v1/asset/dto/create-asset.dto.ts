import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  Validate,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../../common/validators/is-exist.decorator';
import { ValidatePropertiesBySubCategory } from '../../../common/validators/validate-properties-by-subcategory.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';
import { IsNotExist } from '../../../common/validators/is-not-exist.decorator';
import { Asset } from '../entities/asset.entity';

export class CreateAssetPropertyValueDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  value: string | number;
}

export class CreateAssetLabelDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsExist, [SubCategory, 'subCategoryUuid'])
  subCategoryId: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsNotExist, [Asset, 'code'])
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  brand: string;

  @IsOptional()
  model: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsOptional()
  price: number | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  purchaseDate: Date;


  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  @IsNotEmpty()
  isLendable: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  @ValidatePropertiesBySubCategory('subCategoryId', {
    message: 'Properties do not match the subCategory definition',
  })
  properties: CreateAssetPropertyValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetLabelDto)
  @IsOptional()
  labels?: CreateAssetLabelDto[];

  image?: Express.Multer.File;
}
