import { Expose, Type } from 'class-transformer';
import { ResponseCategoryDto } from '../../category/dto/response-category.dto';

export class ResponseSubCategoryDto {
  @Expose({ name: 'subCategoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ResponseCategoryDto)
  category: ResponseCategoryDto;
}