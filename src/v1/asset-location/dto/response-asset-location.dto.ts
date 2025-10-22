import { Expose, Type } from 'class-transformer';
import { ResponseLocationDto } from '../../location/dto/response-location.dto';

export class ResponseAssetLocationDto {
  @Expose({ name: 'assetLocationUuid' })
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ResponseLocationDto)
  location: ResponseLocationDto;
}