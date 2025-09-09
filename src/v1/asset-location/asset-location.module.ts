import { Module } from '@nestjs/common';
import { AssetLocationService } from './asset-location.service';
import { AssetLocationController } from './asset-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLocation } from './entities/asset-location.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Location } from '../location/entities/location.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Asset, AssetLocation, Location])],
  controllers: [AssetLocationController],
  providers: [AssetLocationService],
})
export class AssetLocationModule {}
