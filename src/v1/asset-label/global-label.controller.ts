import { Controller, Get } from '@nestjs/common';
import { AssetLabelService } from './asset-label.service';
import { ApiResponse } from '../../common/utils/ApiResponse';

@Controller()
export class GlobalLabelController {
  constructor(private readonly assetLabelService: AssetLabelService) {}

  @Get()
  async findAllUnique() {
    return new ApiResponse(
      'Unique labels retrieved successfully',
      await this.assetLabelService.findAllUnique(),
    );
  }
}
