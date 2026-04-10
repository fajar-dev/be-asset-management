import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { User } from '../user/entities/user.entity';
import { AssetPropertyValueModule } from '../asset-property-value/asset-property-value.module';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { StorageModule } from '../../storage/storage.module';
import { Reflector } from '@nestjs/core';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { Category } from '../category/entities/category.entity';
import { AssetHolder } from '../asset-holder/entities/asset-holder.entity';
import { AssetLocation } from '../asset-location/entities/asset-location.entity';
import { Location } from '../location/entities/location.entity';
import { AssetUtilsService } from './asset-utils.service';
import { AssetLogModule } from '../asset-log/asset-log.module';
import { GeminiModule } from '../gemini/gemini.module';
import { AssetLabel } from '../asset-label/entities/asset-label.entity';
import { AssetStatus } from '../asset-status/entities/asset-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, SubCategory, AssetPropertyValue, Category, AssetHolder, AssetLocation, Location, User, AssetLabel, AssetStatus]),
    AssetPropertyValueModule,
    AssetLogModule,
    StorageModule,
    GeminiModule
  ],
  controllers: [AssetController],
  providers: [AssetService,
    SerializeV2Interceptor, 
    Reflector,
    AssetUtilsService
  ],
  exports: [TypeOrmModule.forFeature([Asset])],
})
export class AssetModule {}
