import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { Category } from '../category/entities/category.entity';
import { AssetProperty } from '../asset-property/entities/asset-property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory, Category, AssetProperty])],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule {}
