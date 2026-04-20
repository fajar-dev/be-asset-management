import { Expose, Type } from 'class-transformer';

class EmployeeBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}

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
  hasHolder: boolean;

  @Expose()
  @Type(() => EmployeeBranchDto)
  branch: EmployeeBranchDto;
}