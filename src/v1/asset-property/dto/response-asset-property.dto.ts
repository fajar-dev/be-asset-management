import { Expose } from 'class-transformer';
import { DataType } from '../enum/asset-property.enum';

export class ResponseAssetPropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: DataType;
}
