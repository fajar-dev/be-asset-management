import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Category } from '../category/entities/category.entity';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetLocation } from '../asset-location/entities/asset-location.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(AssetLocation)
    private readonly assetLocationRepository: Repository<AssetLocation>,
  ) {}

  async getAllCounts() {
    const [assets, categories, subCategories, locations] = await Promise.all([
      this.assetRepository.count(),
      this.categoryRepository.count(),
      this.subCategoryRepository.count(),
      this.locationRepository.count(),
    ]);

    return {
      assets,
      categories,
      subCategories,
      locations,
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

  async getAssetsByLocation() {
  const subQuery = this.assetLocationRepository
    .createQueryBuilder('al_sub')
    .select('al_sub.asset_id')
    .addSelect('MAX(al_sub.createdAt)', 'maxCreatedAt')
    .where('al_sub.deletedAt IS NULL')
    .groupBy('al_sub.asset_id');

  const result = await this.assetLocationRepository
    .createQueryBuilder('al')
    .leftJoin('al.location', 'location')
    .leftJoin('location.branch', 'branch')
    .leftJoin('al.asset', 'asset')
    .leftJoin(
      '(' + subQuery.getQuery() + ')',
      'latest',
      'al.asset_id = latest.asset_id AND al.createdAt = latest.maxCreatedAt',
    )
    .select('branch.name', 'name')
    .addSelect('COUNT(DISTINCT al.asset_id)', 'value')
    .where('latest.asset_id IS NOT NULL')
    .andWhere('al.deletedAt IS NULL')
    .andWhere('location.deletedAt IS NULL')
    .andWhere('asset.deletedAt IS NULL')
    .andWhere('branch.deletedAt IS NULL')
    .groupBy('branch.id, branch.name')
    .setParameters(subQuery.getParameters())
    .getRawMany();

  return result.map(item => ({
    name: item.name,
    value: parseInt(item.value, 10),
  }));
}

}
