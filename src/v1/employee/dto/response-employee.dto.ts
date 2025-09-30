import { Expose, Type } from 'class-transformer';

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
}