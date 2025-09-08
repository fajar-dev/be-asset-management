import { Test, TestingModule } from '@nestjs/testing';
import { AssetPropertyController } from './asset-property.controller';
import { AssetPropertyService } from './asset-property.service';

describe('AssetPropertyController', () => {
  let controller: AssetPropertyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetPropertyController],
      providers: [AssetPropertyService],
    }).compile();

    controller = module.get<AssetPropertyController>(AssetPropertyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
