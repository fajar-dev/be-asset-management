import { Module } from '@nestjs/common';
import { AssetLocationService } from './asset-location.service';
import { AssetLocationController } from './asset-location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLocation } from './entities/asset-location.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Location } from '../location/entities/location.entity';
import { APP_GUARD } from '@nestjs/core';
import { CategoryGuard } from '../category/guards/category.guard';
import { AssetLogModule } from '../asset-log/asset-log.module';
import { User } from '../user/entities/user.entity';

@Module({
imports:[
  TypeOrmModule.forFeature([Asset, AssetLocation, Location, User]),
  AssetLogModule
],
  controllers: [AssetLocationController],
  providers: [
    AssetLocationService,
    {
      provide: APP_GUARD,
      useClass: CategoryGuard,
    },
  ],
})
export class AssetLocationModule {}