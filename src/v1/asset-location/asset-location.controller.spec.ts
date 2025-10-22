import { Test, TestingModule } from '@nestjs/testing';
import { AssetLocationController } from './asset-location.controller';
import { AssetLocationService } from './asset-location.service';

describe('AssetLocationController', () => {
  let controller: AssetLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetLocationController],
      providers: [AssetLocationService],
    }).compile();

    controller = module.get<AssetLocationController>(AssetLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
