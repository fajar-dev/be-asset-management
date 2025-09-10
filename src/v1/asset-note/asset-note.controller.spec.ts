import { Test, TestingModule } from '@nestjs/testing';
import { AssetNoteController } from './asset-note.controller';
import { AssetNoteService } from './asset-note.service';

describe('AssetNoteController', () => {
  let controller: AssetNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetNoteController],
      providers: [AssetNoteService],
    }).compile();

    controller = module.get<AssetNoteController>(AssetNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
