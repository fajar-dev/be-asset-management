import { Expose } from 'class-transformer';

export class ResponseCategoryDto {
  @Expose({ name: 'categoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  hasMaintenance: boolean;

  @Expose()
  hasHolder: boolean;
}