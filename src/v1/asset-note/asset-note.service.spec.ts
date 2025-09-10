import { Test, TestingModule } from '@nestjs/testing';
import { AssetNoteService } from './asset-note.service';

describe('AssetNoteService', () => {
  let service: AssetNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetNoteService],
    }).compile();

    service = module.get<AssetNoteService>(AssetNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
