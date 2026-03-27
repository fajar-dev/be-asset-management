import { Expose, Type } from 'class-transformer';

export class ResponseUserForLogDto  {
  @Expose({ name: 'employeeId' })
  employeeId: string;

  @Expose()
  name: string;
}

export class ResponseAssetLogDto {
  @Expose({ name: 'assetLogUuid' })
  id: string;

  @Expose()
  message: string;

  @Expose()
  @Type(() => ResponseUserForLogDto)
  user: ResponseUserForLogDto;

  @Expose()
  type: string;

  @Expose()
  createdAt: Date;
}