import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetHolder } from './entities/asset-holder.entity';
import { Asset } from '../asset/entities/asset.entity';
import { AssetHolderController } from './asset-holder.controller';
import { AssetHolderService } from './asset-holder.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetHolder, Asset])], 
  controllers: [AssetHolderController],
  providers: [AssetHolderService],

})
export class AssetHolderModule {}

