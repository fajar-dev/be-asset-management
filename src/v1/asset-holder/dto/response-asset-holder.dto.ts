import { Expose, Type } from 'class-transformer';
import { ResponseEmployeeDto } from 'src/v1/employee/dto/response-employee.dto';

export class ResponseAssetHolderDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  purpose: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt: Date | null;

  @Expose()
  @Type(() => ResponseEmployeeDto)
  employee: ResponseEmployeeDto
}
