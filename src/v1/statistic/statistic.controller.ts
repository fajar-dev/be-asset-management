import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
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

  @Get('price-by-category')
  async getPriceByCategory() {
    return new ApiResponse(
      'Price by category retrieved successfully',
      await this.statisticService.getPriceByCategory(),
    );
  }

  @Get('price-by-location')
  async getPriceByLocation() {
    return new ApiResponse(
      'Price by location retrieved successfully',
      await this.statisticService.getPriceByLocation(),
    );
  }

  @Get('asset-aging')
  async getAssetAging() {
    return new ApiResponse(
      'Asset aging statistics retrieved successfully',
      await this.statisticService.getAssetAging(),
    );
  }

  @Get('data-quality')
  async getDataQuality() {
    return new ApiResponse(
      'Data quality statistics retrieved successfully',
      await this.statisticService.getDataQuality(),
    );
  }
}
