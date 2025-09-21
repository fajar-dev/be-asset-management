import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../branch/entities/branch.entity';
import { Employee } from './entities/employee.entity';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Employee])], 
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
