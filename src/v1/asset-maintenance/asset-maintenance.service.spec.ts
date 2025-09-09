import { Test, TestingModule } from '@nestjs/testing';
import { AssetMaintenanceService } from './asset-maintenance.service';

describe('AssetMaintenanceService', () => {
  let service: AssetMaintenanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetMaintenanceService],
    }).compile();

    service = module.get<AssetMaintenanceService>(AssetMaintenanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
