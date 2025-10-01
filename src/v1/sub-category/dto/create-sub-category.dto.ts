import { IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsExist } from '../../../common/validators/is-exist.decorator';
import { Category } from '../../category/entities/category.entity';
import { SubCategory } from '../entities/sub-category.entity';

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsExist, [Category, 'categoryUuid'])
  categoryId: string;

  @IsOptional()
  @IsString()
  @Validate(IsExist, [SubCategory, 'subCategoryUuid'])
  parentId?: string;
}