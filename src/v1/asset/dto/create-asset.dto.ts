import { IsNotEmpty, IsString, Validate, IsOptional } from 'class-validator';
import { SubCategory } from 'src/v1/sub-category/entities/sub-category.entity';
import { IsExist } from 'src/common/validators/is-exist.decorator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsExist, [SubCategory, 'subCategoryUuid'])
  subCategoryId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  description?: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;
}