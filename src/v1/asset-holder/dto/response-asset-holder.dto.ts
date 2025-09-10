import { Expose } from 'class-transformer';

export class ResponseAssetHolderDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  employeeId: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt: Date | null;
}
