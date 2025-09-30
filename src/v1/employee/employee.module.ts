import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])], 
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
