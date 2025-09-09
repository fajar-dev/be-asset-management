import { Test, TestingModule } from '@nestjs/testing';
import { AssetLocationService } from './asset-location.service';

describe('AssetLocationService', () => {
  let service: AssetLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetLocationService],
    }).compile();

    service = module.get<AssetLocationService>(AssetLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
