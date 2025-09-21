import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Employee } from '../employee/entities/employee.entity';
import { BranchController } from './branch.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Employee])], 
  providers: [BranchService],
  exports: [BranchService],
  controllers: [BranchController]
})
export class BranchModule {}
