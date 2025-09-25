import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValueModule } from '../asset-property-value/asset-property-value.module';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { StorageModule } from '../../storage/storage.module';
import { Reflector } from '@nestjs/core';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, SubCategory, AssetPropertyValue]),
    AssetPropertyValueModule,
    StorageModule
  ],
  controllers: [AssetController],
  providers: [AssetService,
    SerializeV2Interceptor, 
    Reflector
  ],
  exports: [TypeOrmModule.forFeature([Asset])],
})
export class AssetModule {}
