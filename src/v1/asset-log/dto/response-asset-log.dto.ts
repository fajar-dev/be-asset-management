import { Expose, Type } from 'class-transformer';

export class ResponseEmployeeDto  {
  @Expose({ name: 'idEmployee' })
  employeeId: string;

  @Expose()
  fullName: string;
}

export class ResponseAssetLogDto {
  @Expose({ name: 'assetLogUuid' })
  id: string;

  @Expose()
  message: string;

  @Expose()
  @Type(() => ResponseEmployeeDto)
  employee: ResponseEmployeeDto;

  @Expose()
  type: string;

  @Expose()
  createdAt: Date;
}