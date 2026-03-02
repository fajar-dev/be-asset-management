import { Module } from '@nestjs/common';
import { AssetNoteService } from './asset-note.service';
import { AssetNoteController } from './asset-note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenance } from '../asset-maintenance/entities/asset-maintenance.entity';
import { AssetNote } from './entities/asset-note.entity';
import { Asset } from '../asset/entities/asset.entity';

import { AssetLogModule } from '../asset-log/asset-log.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetNote, User]),
    AssetLogModule
  ],
  controllers: [AssetNoteController],
  providers: [AssetNoteService],
})
export class AssetNoteModule {}
