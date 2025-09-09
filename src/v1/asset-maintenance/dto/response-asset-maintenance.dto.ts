import { Expose } from 'class-transformer';

export class ResponseAssetMaintenanceDto {
  @Expose({ name: 'assetMaintenanceUuid' })
  id: string;

  @Expose()
  maintenanceAt: Date;

  @Expose()
  note: string
}
