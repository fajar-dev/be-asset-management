import { IsString, IsNotEmpty, ValidateNested, IsArray, Validate, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SubCategory } from '../../../v1/sub-category/entities/sub-category.entity';
import { IsExist } from '../../..//common/validators/is-exist.decorator';
import { IsOptional } from '../../../common/validators/optional.decorator';
import { IsUniqueExceptSelf } from '../../../common/validators/is-unique-except-self.decorator';

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
  properties: CreateAssetPropertyValueDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetLabelDto)
  @IsOptional()
  labels?: CreateAssetLabelDto[];

  image?: Express.Multer.File;
}
