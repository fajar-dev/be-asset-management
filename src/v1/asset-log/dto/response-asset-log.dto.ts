import { Expose } from 'class-transformer';
import { Employee } from '../../employee/entities/employee.entity';

export class ResponseAssetLogDto {
  @Expose({ name: 'assetLogUuid' })
  id: string;

  @Expose()
  message: string;

  @Expose()
  employee: Employee;

  @Expose()
  createdAt: Date;
}