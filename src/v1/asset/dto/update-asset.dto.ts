import { IsString, IsNotEmpty, ValidateNested, IsArray, Validate, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../..//common/validators/is-exist.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';
import { IsUniqueExceptSelf } from '../../../common/validators/is-unique-except-self.decorator';
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
  status: Status

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  properties: CreateAssetPropertyValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomValueDto)
  @IsOptional()
  customValues?: CreateCustomValueDto[];

  image?: Express.Multer.File;
}
