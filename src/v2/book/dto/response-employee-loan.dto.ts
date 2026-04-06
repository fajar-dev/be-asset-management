import { Expose, Type } from 'class-transformer';
import { ResponseEmployeeDto } from '../../../v1/employee/dto/response-employee.dto';
import { ResponseBookLoanDto } from './response-book-loan.dto';

export class ResponseEmployeeLoanDto {
  @Expose()
  @Type(() => ResponseEmployeeDto)
  employee: ResponseEmployeeDto;

  @Expose()
  @Type(() => ResponseBookLoanDto)
  loans: ResponseBookLoanDto[];
}
