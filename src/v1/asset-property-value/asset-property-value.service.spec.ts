import { Test, TestingModule } from '@nestjs/testing';
import { AssetPropertyValueService } from './asset-property-value.service';

describe('AssetPropertyValueService', () => {
  let service: AssetPropertyValueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetPropertyValueService],
    }).compile();

    service = module.get<AssetPropertyValueService>(AssetPropertyValueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
