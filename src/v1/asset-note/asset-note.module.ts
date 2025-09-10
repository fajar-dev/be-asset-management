import { Module } from '@nestjs/common';
import { AssetNoteService } from './asset-note.service';
import { AssetNoteController } from './asset-note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenance } from '../asset-maintenance/entities/asset-maintenance.entity';
import { AssetNote } from './entities/asset-note.entity';
import { Asset } from '../asset/entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetNote]),
  ],
  controllers: [AssetNoteController],
  providers: [AssetNoteService],
})
export class AssetNoteModule {}
