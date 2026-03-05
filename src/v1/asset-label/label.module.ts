import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLabelService } from '../asset-label/asset-label.service';
import { GlobalLabelController } from '../asset-label/global-label.controller';
import { AssetLabel } from '../asset-label/entities/asset-label.entity';
import { Asset } from '../asset/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetLabel, Asset])],
  controllers: [GlobalLabelController],
  providers: [AssetLabelService],
})
export class LabelModule {}
