import { Expose, Type } from 'class-transformer';
import { ResponseAssetDto } from '../../asset/dto/response-asset.dto';

export class ResponseUserAssetDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  purpose: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt: Date | null;

  @Expose()
  attachmentPaths: string[];

  @Expose()
  attachmentUrls: string[];

  @Expose()
  isRequest: boolean;

  @Expose()
  @Type(() => ResponseAssetDto)
  asset: ResponseAssetDto;
}
