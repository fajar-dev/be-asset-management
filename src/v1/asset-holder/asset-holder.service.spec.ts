import { Test, TestingModule } from '@nestjs/testing';
import { AssetHolderService } from './asset-holder.service';

describe('AssetHolderService', () => {
  let service: AssetHolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetHolderService],
    }).compile();

    service = module.get<AssetHolderService>(AssetHolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
