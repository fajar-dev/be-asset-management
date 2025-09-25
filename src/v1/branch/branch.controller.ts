import { Controller, DefaultValuePipe, Get, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { ResponseBranchDto } from './dto/response-branch.dto';

@Controller()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}
  
  @Get()
  @Serialize(ResponseBranchDto)
  async findAll(
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Branches retrieved successfully',
      await this.branchService.findAll( search )
    );
  }
}
