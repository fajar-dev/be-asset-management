import { Expose } from 'class-transformer';

export class ResponseAssetLabelDto {
  @Expose()
  assetLabelUuid: string;

  @Expose()
  key: string;

  @Expose()
  value: string;

  @Expose()
  createdAt: Date;
}
