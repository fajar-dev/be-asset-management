import { Module } from '@nestjs/common';
import { AssetPropertyService } from './asset-property.service';
import { AssetPropertyController } from './asset-property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetProperty } from './entities/asset-property.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetProperty, SubCategory])],
  controllers: [AssetPropertyController],
  providers: [AssetPropertyService],
})
export class AssetPropertyModule {}
