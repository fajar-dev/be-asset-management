import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValueModule } from '../asset-property-value/asset-property-value.module';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, SubCategory, AssetPropertyValue]),
    AssetPropertyValueModule
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [TypeOrmModule.forFeature([Asset])],
})
export class AssetModule {}
