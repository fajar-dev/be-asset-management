import { Test, TestingModule } from '@nestjs/testing';
import { AssetLogService } from './asset-log.service';

describe('AssetLogService', () => {
  let service: AssetLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetLogService],
    }).compile();

    service = module.get<AssetLogService>(AssetLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
