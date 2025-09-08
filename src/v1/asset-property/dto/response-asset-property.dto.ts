import { Expose } from 'class-transformer';

export class ResponseAssetPropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: 'string' | 'int';
}
