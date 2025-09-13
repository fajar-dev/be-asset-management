import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategoryService } from '../sub-category/sub-category.service';
import { SubCategory } from '../sub-category/entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory])],
  controllers: [CategoryController],
  providers: [CategoryService, SubCategoryService],
})
export class CategoryModule {}
