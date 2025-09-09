import { Expose } from 'class-transformer';

export class ResponselocationDto {
  @Expose({ name: 'locationUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  branch: string;
}