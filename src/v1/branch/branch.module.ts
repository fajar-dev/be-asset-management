import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Location } from '../location/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Employee, Location])], 
  providers: [BranchService],
  exports: [BranchService],
  controllers: [BranchController]
})
export class BranchModule {}
