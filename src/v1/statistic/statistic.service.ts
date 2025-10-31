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
      .select('category.categoryUuid', 'id')
      .addSelect('category.name', 'name')
      .addSelect('COUNT(asset.id)', 'value')
      .where('asset.deletedAt IS NULL')
      .andWhere('subCategory.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .groupBy('category.id, category.name')
      .orderBy('COUNT(asset.id)', 'DESC')
      .getRawMany();

    return result.map(item => ({
      id: item.id,
      name: item.name || 'Uncategorized',
      value: parseInt(item.value, 10),
    }));
  }

  async getAssetsBySubCategory() {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.subCategory', 'subCategory')
      .select('subCategory.subCategoryUuid', 'id')
      .addSelect('subCategory.name', 'name')
      .addSelect('COUNT(asset.id)', 'value')
      .where('asset.deletedAt IS NULL')
      .andWhere('subCategory.deletedAt IS NULL')
      .groupBy('subCategory.id, subCategory.name')
      .orderBy('COUNT(asset.id)', 'DESC')
      .getRawMany();

    return result.map(item => ({
      id: item.id,
      name: item.name || 'Uncategorized',
      value: parseInt(item.value, 10),
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
    .leftJoin('location.branch', 'branch') // 👈 join ke branch
    .leftJoin('al.asset', 'asset')
    .leftJoin(
      '(' + subQuery.getQuery() + ')',
      'latest',
      'al.asset_id = latest.asset_id AND al.createdAt = latest.maxCreatedAt',
    )
    .select('location.locationUuid', 'id')
    .addSelect('location.name', 'name')
    .addSelect('branch.name', 'branchName') // 👈 ambil nama branch
    .addSelect('COUNT(DISTINCT al.asset_id)', 'value')
    .where('latest.asset_id IS NOT NULL')
    .andWhere('al.deletedAt IS NULL')
    .andWhere('location.deletedAt IS NULL')
    .andWhere('asset.deletedAt IS NULL')
    .groupBy('location.id, location.locationUuid, location.name, branch.name') // 👈 tambahkan branch
    .orderBy('COUNT(DISTINCT al.asset_id)', 'DESC')
    .setParameters(subQuery.getParameters())
    .getRawMany();

  return result.map(item => ({
    id: item.id,
    name: item.name,
    branch: item.branchName || 'Unknown Branch',
    value: parseInt(item.value, 10),
  }));
}

}
