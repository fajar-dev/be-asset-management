import { Test, TestingModule } from '@nestjs/testing';
import { AssetLogController } from './asset-log.controller';
import { AssetLogService } from './asset-log.service';

describe('AssetLogController', () => {
  let controller: AssetLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetLogController],
      providers: [AssetLogService],
    }).compile();

    controller = module.get<AssetLogController>(AssetLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
