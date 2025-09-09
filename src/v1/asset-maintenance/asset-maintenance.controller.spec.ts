import { Test, TestingModule } from '@nestjs/testing';
import { AssetMaintenanceController } from './asset-maintenance.controller';
import { AssetMaintenanceService } from './asset-maintenance.service';

describe('AssetMaintenanceController', () => {
  let controller: AssetMaintenanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetMaintenanceController],
      providers: [AssetMaintenanceService],
    }).compile();

    controller = module.get<AssetMaintenanceController>(AssetMaintenanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
