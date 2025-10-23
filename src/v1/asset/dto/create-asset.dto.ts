import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  Validate,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../../common/validators/is-exist.decorator';
import { ValidatePropertiesBySubCategory } from '../../../common/validators/validate-properties-by-subcategory.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';
import { IsNotExist } from '../../../common/validators/is-not-exist.decorator';
import { Asset } from '../entities/asset.entity';
import { Status } from '../enum/asset.enum';

export class CreateAssetPropertyValueDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  value: string | number;
}

export class CreateCustomValueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
  price: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  purchaseDate: Date;

  @IsEnum(Status, {
    message: 'status must be one of: active, in repair, disposed',
  })
  @IsNotEmpty()
  status: Status;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  @ValidatePropertiesBySubCategory('subCategoryId', {
    message: 'Properties do not match the subCategory definition',
  })
  properties: CreateAssetPropertyValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomValueDto)
  @IsOptional()
  customValues?: CreateCustomValueDto[];

  image?: Express.Multer.File;
}
