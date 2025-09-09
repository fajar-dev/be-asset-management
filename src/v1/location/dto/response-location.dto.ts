import { Expose } from 'class-transformer';

export class ResponseLocationDto {
  @Expose({ name: 'locationUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  branch: string;
}