import { Controller, DefaultValuePipe, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { ResponseBranchDto, } from './dto/response-branch.dto';
import { ResponseLocationDto } from '../location/dto/response-location.dto';

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

  @Get(':id/location')
  @Serialize(ResponseLocationDto)
  async findLocation(
    @Param('id', new DefaultValuePipe('')) branchId: string,
  ) {
    return new ApiResponse(
      'Locations retrieved successfully',
      await this.branchService.findLocation( branchId )
    );
  }
}
