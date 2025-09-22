import { Expose, Type } from 'class-transformer';
import { ResponseBranchDto } from '../../../v1/branch/dto/response-branch.dto';

export class ResponseEmployeeDto {
  @Expose({ name: 'idEmployee' })
  employeeId: string;

  @Expose()
  fullName: string;

  @Expose()
  jobPosition: string;

  @Expose()
  email: string;

  @Expose()
  mobilePhone: string;

  @Expose()
  photoProfile: string;
  
  @Expose()
  @Type(() => ResponseBranchDto)
  branch: ResponseBranchDto;

  @Expose()
  hasHolder: boolean;
}