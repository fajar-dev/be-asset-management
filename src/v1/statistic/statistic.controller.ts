import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('count')
  async getAllCounts() {
    return new ApiResponse(
      'Counts retrieved successfully',
      await this.statisticService.getAllCounts(),
    );
  }

  @Get('assets-by-category')
  async getAssetsByCategory() {
    return new ApiResponse(
      'Assets by category retrieved successfully',
      await this.statisticService.getAssetsByCategory(),
    );
  }

  @Get('assets-by-sub-category')
  async getAssetsBySubCategory() {
    return new ApiResponse(
      'Assets by sub-category retrieved successfully',
      await this.statisticService.getAssetsBySubCategory(),
    );
  }

  @Get('assets-by-location')
  async getAssetsByLocation() {
    return new ApiResponse(
      'Assets by location retrieved successfully',
      await this.statisticService.getAssetsByLocation(),
    );
  }
}
