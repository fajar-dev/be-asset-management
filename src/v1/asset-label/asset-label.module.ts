import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLabelService } from './asset-label.service';
import { AssetLabelController } from './asset-label.controller';
import { GlobalLabelController } from './global-label.controller';
import { AssetLabel } from './entities/asset-label.entity';
import { Asset } from '../asset/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetLabel, Asset])],
  controllers: [AssetLabelController],
  providers: [AssetLabelService],
})
export class AssetLabelModule {}
