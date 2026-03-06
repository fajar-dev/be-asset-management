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
    const [assets, categories, subCategories, locations, totalPriceResult] = await Promise.all([
      this.assetRepository.count(),
      this.categoryRepository.count(),
      this.subCategoryRepository.count(),
      this.locationRepository.count(),
      this.assetRepository
        .createQueryBuilder('asset')
        .select('SUM(asset.price)', 'total')
        .where('asset.deletedAt IS NULL')
        .getRawOne(),
    ]);

    return {
      assets,
      categories,
      subCategories,
      locations,
      totalPrice: parseFloat(totalPriceResult.total) || 0,
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

async getPriceByCategory() {
  const result = await this.assetRepository
    .createQueryBuilder('asset')
    .leftJoin('asset.subCategory', 'subCategory')
    .leftJoin('subCategory.category', 'category')
    .select('category.categoryUuid', 'id')
    .addSelect('category.name', 'name')
    .addSelect('SUM(asset.price)', 'value')
    .where('asset.deletedAt IS NULL')
    .andWhere('subCategory.deletedAt IS NULL')
    .andWhere('category.deletedAt IS NULL')
    .groupBy('category.id, category.name')
    .orderBy('SUM(asset.price)', 'DESC')
    .getRawMany();

  return result.map(item => ({
    id: item.id,
    name: item.name || 'Uncategorized',
    value: parseFloat(item.value) || 0,
  }));
}

async getPriceByLocation() {
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
    .select('location.locationUuid', 'id')
    .addSelect('location.name', 'name')
    .addSelect('branch.name', 'branchName')
    .addSelect('SUM(asset.price)', 'value')
    .where('latest.asset_id IS NOT NULL')
    .andWhere('al.deletedAt IS NULL')
    .andWhere('location.deletedAt IS NULL')
    .andWhere('asset.deletedAt IS NULL')
    .groupBy('location.id, location.locationUuid, location.name, branch.name')
    .orderBy('SUM(asset.price)', 'DESC')
    .setParameters(subQuery.getParameters())
    .getRawMany();

  return result.map(item => ({
    id: item.id,
    name: item.name,
    branch: item.branchName || 'Unknown Branch',
    value: parseFloat(item.value) || 0,
  }));
}

async getAssetAging() {
  const agingExpression = `
    CASE 
      WHEN TIMESTAMPDIFF(YEAR, asset.purchaseDate, CURDATE()) <= 2 THEN '0–2 Years'
      WHEN TIMESTAMPDIFF(YEAR, asset.purchaseDate, CURDATE()) <= 5 THEN '3–5 Years'
      ELSE '>=5 Years'
    END
  `;

  const result = await this.assetRepository
    .createQueryBuilder('asset')
    .select(agingExpression, 'name')
    .addSelect('COUNT(*)', 'total')
    .where('asset.deletedAt IS NULL')
    .andWhere('asset.purchaseDate IS NOT NULL')
    .groupBy(agingExpression)
    .getRawMany();

  // Initialize summary with expected labels and zero values
  const summary: Record<string, number> = {
    '0–2 Years': 0,
    '3–5 Years': 0,
    '>=5 Years': 0,
  };

  result.forEach(item => {
    // TypeORM getRawMany keys can be case-sensitive or prefixed depending on driver/version
    // We check for both 'name' and 'total' as provided in the query aliases
    const name = item.name || item.asset_name;
    const value = item.total || item.value || item.asset_total;
    
    if (name && summary.hasOwnProperty(name)) {
      summary[name] = parseInt(value, 10) || 0;
    }
  });

  return Object.keys(summary).map(name => ({
    name: name,
    value: summary[name],
  }));
}

async getDataQuality() {
  const result = await this.assetRepository
    .createQueryBuilder('asset')
    .select(
      `SUM(CASE WHEN asset.imagePath = '/image/no-image.jpg' OR asset.imagePath IS NULL THEN 1 ELSE 0 END)`,
      'withoutImage',
    )
    .addSelect(
      `SUM(CASE WHEN asset.price = 0 OR asset.price IS NULL THEN 1 ELSE 0 END)`,
      'withoutPrice',
    )
    .addSelect(
      `SUM(CASE WHEN asset.brand IS NULL OR asset.brand = '' THEN 1 ELSE 0 END)`,
      'withoutBrand',
    )
    .addSelect(
      `SUM(CASE WHEN asset.model IS NULL OR asset.model = '' THEN 1 ELSE 0 END)`,
      'withoutModel',
    )
    .where('asset.deletedAt IS NULL')
    .getRawOne();

  return [
    { name: 'Assets Without Image', value: parseInt(result.withoutImage, 10) || 0 },
    { name: 'Assets Without Price', value: parseInt(result.withoutPrice, 10) || 0 },
    { name: 'Assets Without Brand', value: parseInt(result.withoutBrand, 10) || 0 },
    { name: 'Assets Without Model', value: parseInt(result.withoutModel, 10) || 0 },
  ];
}
}
