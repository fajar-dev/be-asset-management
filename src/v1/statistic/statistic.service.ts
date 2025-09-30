import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Category } from '../category/entities/category.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  async getAllCounts() {
    const [assets, categories, subCategories] = await Promise.all([
      this.assetRepository.count(),
      this.categoryRepository.count(),
      this.subCategoryRepository.count(),
    ]);

    return {
      assets,
      categories,
      subCategories,
    };
  }

  async getAssetsByCategory() {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.subCategory', 'subCategory')
      .leftJoin('subCategory.category', 'category')
      .select('category.name', 'name')
      .addSelect('COUNT(asset.id)', 'value')
      .where('asset.deletedAt IS NULL')
      .andWhere('subCategory.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .groupBy('category.id, category.name')
      .getRawMany();

    return result.map(item => ({
      name: item.name || 'Uncategorized',
      value: parseInt(item.value),
    }));
  }

  async getAssetsBySubCategory() {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.subCategory', 'subCategory')
      .select('subCategory.name', 'name')
      .addSelect('COUNT(asset.id)', 'value')
      .where('asset.deletedAt IS NULL')
      .andWhere('subCategory.deletedAt IS NULL')
      .groupBy('subCategory.id, subCategory.name')
      .getRawMany();

    return result.map(item => ({
      name: item.name || 'Uncategorized',
      value: parseInt(item.value),
    }));
  }
}
