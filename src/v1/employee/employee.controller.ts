import { Controller, DefaultValuePipe, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { EmployeeService } from './employee.service';
import { ResponseEmployeeDto } from './dto/response-employee.dto';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseEmployeeDto)
  async findAll(
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Employees retrieved successfully',
      await this.employeeService.findAll( search )
    );
  }
}
