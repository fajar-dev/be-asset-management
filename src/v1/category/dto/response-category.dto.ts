import { Expose } from 'class-transformer';

export class ResponseCategoryDto {
  @Expose({ name: 'categoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  has_location: boolean;

  @Expose()
  has_maintenance: boolean;

  @Expose()
  has_holder: boolean;
}