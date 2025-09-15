import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository, In } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(AssetPropertyValue)
    private readonly assetPropertyValueRepository: Repository<AssetPropertyValue>,
  ) {}
  
/**
 * Create a new asset
 * @param userId - ID user yang membuat asset
 * @param createAssetDto - DTO containing data to create an asset
 * @returns Promise<Asset> - the created asset entity
 */
async create(
  userId: number,
  createAssetDto: CreateAssetDto,
): Promise<Asset> {
  const subCategory = await this.subCategoryRepository.findOneOrFail({
    where: { subCategoryUuid: createAssetDto.subCategoryId },
    relations: ['assetProperties'],
  });

  const asset = this.assetRepository.create({
    subCategoryId: subCategory.id,
    name: createAssetDto.name,
    code: createAssetDto.code,
    description: createAssetDto.description,
    brand: createAssetDto.brand,
    model: createAssetDto.model,
    createdBy: userId,
  });
  const savedAsset = await this.assetRepository.save(asset);

  const propertyValues = createAssetDto.properties.map((p) => {
    const propertyDef = subCategory.assetProperties.find(
      (def) => def.assetPropertyUuid === p.id,
    );

    if (!propertyDef) {
      throw new Error(`Property dengan id ${p.id} tidak ditemukan di SubCategory`);
    }

    return this.assetPropertyValueRepository.create({
      assetId: savedAsset.id,
      propertyId: propertyDef.id,
      valueString: propertyDef.dataType === 'string' ? String(p.value) : null,
      valueInt: propertyDef.dataType === 'number' ? Number(p.value) : null,
      createdBy: userId,
    });
  });

  await this.assetPropertyValueRepository.save(propertyValues);

  return this.assetRepository.findOneOrFail({
    where: { id: savedAsset.id },
    relations: ['propertyValues', 'propertyValues.property', 'subCategory', 'subCategory.category'],
  });
}


  /**
 * Paginate assets with optional search and filters by category or sub-category
 * @param options - Pagination options plus optional search string and/or sub-category/category UUIDs
 * @returns Promise<Pagination<Asset>> - paginated result of assets
 */
async paginate(
  options: IPaginationOptions & {
    search?: string;
    subCategoryId?: string;
    categoryId?: string;
    status?: string;
  },
): Promise<Pagination<Asset>> {
  const { search, subCategoryId, categoryId, status, ...paginationOptions } = options;

  const queryBuilder = this.assetRepository.createQueryBuilder('asset')
    .leftJoinAndSelect('asset.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category');

  if (search) {
    queryBuilder.andWhere(
      '(asset.name LIKE :search OR asset.assetUuid LIKE :search OR asset.model LIKE :search OR asset.brand LIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (subCategoryId) {
    queryBuilder.andWhere('subCategory.subCategoryUuid = :subCategoryId', { 
      subCategoryId 
    });
  }

  if (categoryId) {
    queryBuilder.andWhere('category.categoryUuid = :categoryId', { 
      categoryId 
    });
  }

  if (status) {
    queryBuilder.andWhere('asset.status = :status', { status });
  }

  // 📋 Order by untuk konsistensi hasil
  queryBuilder.orderBy('asset.createdAt', 'DESC');

  // 📄 Execute pagination
  const paginationResult = await paginate<Asset>(queryBuilder, paginationOptions);

  // 🚀 Stage 2: Load propertyValues untuk items yang sudah dipaginate
  if (paginationResult.items.length > 0) {
      const assetsWithProperties = await this.assetRepository.find({
        where: { 
          assetUuid: In(paginationResult.items.map(asset => asset.assetUuid)) 
        },
        relations: ['propertyValues', 'propertyValues.property']
      });
      (paginationResult as any).items = paginationResult.items.map(asset => {
        const fullAsset = assetsWithProperties.find(a => a.assetUuid === asset.assetUuid);
        return { ...asset, propertyValues: fullAsset?.propertyValues || [] };
      });
    }

    return paginationResult;
}


  /**
   * Find an asset by UUID
   * @param id - UUID of the asset
   * @returns Promise<Asset> - the found asset entity
   * @throws NotFoundException if the asset is not found
   */
    findOne(id: string): Promise<Asset> {
      return this.assetRepository.findOneOrFail({
      where: { assetUuid: id },
      relations: ['propertyValues', 'propertyValues.property', 'subCategory', 'subCategory.category'],
    });
  }

}
