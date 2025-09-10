import { Test, TestingModule } from '@nestjs/testing';
import { AssetHolderController } from './asset-holder.controller';

describe('AssetHolderController', () => {
  let controller: AssetHolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetHolderController],
    }).compile();

    controller = module.get<AssetHolderController>(AssetHolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
