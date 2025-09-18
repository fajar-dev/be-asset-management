import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getAllCounts() {
    return new ApiResponse(
      'Counts retrieved successfully',
      await this.statisticService.getAllCounts(),
    );
  }

  @Get('assets-by-category')
  @UseGuards(JwtAuthGuard)
  async getAssetsByCategory() {
    return new ApiResponse(
      'Assets by category retrieved successfully',
      await this.statisticService.getAssetsByCategory(),
    );
  }

  @Get('assets-by-sub-category')
  @UseGuards(JwtAuthGuard)
  async getAssetsBySubCategory() {
    return new ApiResponse(
      'Assets by sub-category retrieved successfully',
      await this.statisticService.getAssetsBySubCategory(),
    );
  }

  @Get('assets-by-location')
  @UseGuards(JwtAuthGuard)
  async getAssetsByLocation() {
    return new ApiResponse(
      'Assets by location retrieved successfully',
      await this.statisticService.getAssetsByLocation(),
    );
  }
}
