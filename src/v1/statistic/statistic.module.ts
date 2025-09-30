import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Category } from '../category/entities/category.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Category, SubCategory])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
