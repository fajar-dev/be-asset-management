import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository, In } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(AssetPropertyValue)
    private readonly assetPropertyValueRepository: Repository<AssetPropertyValue>,
    private storageService: StorageService,
  ) {}
  
  /**
   * Create a new asset
   * @param userId - ID user yang membuat asset
   * @param createAssetDto - DTO containing data to create an asset
   * @returns Promise<Asset> - the created asset entity
   */
  async create(userId: number, createAssetDto: CreateAssetDto): Promise<Asset> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: createAssetDto.subCategoryId },
      relations: ['assetProperties'],
    });

    let imagePath: string | undefined;
    if (createAssetDto.image) {
      imagePath = await this.storageService.uploadFile('image', createAssetDto.image);
    }

    const asset = this.assetRepository.create({
      subCategoryId: subCategory.id,
      code: createAssetDto.code,
      name: createAssetDto.name,
      description: createAssetDto.description,
      brand: createAssetDto.brand,
      model: createAssetDto.model,
      status: createAssetDto.status,
      createdBy: userId,
      imagePath,
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

    if (propertyValues.length) {
      await this.assetPropertyValueRepository.save(propertyValues);
    }

    return this.assetRepository.findOneOrFail({
      where: { id: savedAsset.id },
      relations: [
        'propertyValues',
        'propertyValues.property',
        'subCategory',
        'subCategory.category',
      ],
    });
  }

  /**
   * Update an asset
   * @param assetId - ID asset yang akan diupdate
   * @param userId - ID user yang mengupdate
   * @param updateAssetDto - DTO containing data to update an asset
   * @returns Promise<Asset> - the updated asset entity
   */
  async update(
    assetId: string,
    userId: number,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: updateAssetDto.subCategoryId },
      relations: ['assetProperties'],
    });

    let imagePath: string | undefined;
    if (updateAssetDto.image) {
      imagePath = await this.storageService.uploadFile('image', updateAssetDto.image);
    }

    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: assetId },
    });

    asset.subCategoryId = subCategory.id;
    asset.code = updateAssetDto.code;
    asset.name = updateAssetDto.name;
    asset.description = updateAssetDto.description;
    asset.brand = updateAssetDto.brand;
    asset.model = updateAssetDto.model;
    asset.status = updateAssetDto.status;
    asset.updatedBy = userId;
    asset.imagePath = imagePath || asset.imagePath;
    await this.assetRepository.save(asset);

    await this.assetPropertyValueRepository.delete({ assetId: asset.id });

    const propertyValues = updateAssetDto.properties.map((p) => {
      const propertyDef = subCategory.assetProperties.find(
        (def) => def.assetPropertyUuid === p.id,
      );

      if (!propertyDef) {
        throw new Error(
          `Property dengan id ${p.id} tidak ditemukan di SubCategory ${subCategory.subCategoryUuid}`,
        );
      }

      return this.assetPropertyValueRepository.create({
        assetId: asset.id,
        propertyId: propertyDef.id,
        valueString:
          propertyDef.dataType === 'string' ? String(p.value) : null,
        valueInt:
          propertyDef.dataType === 'number' ? Number(p.value) : null,
        createdBy: userId,
      });
    });

    await this.assetPropertyValueRepository.save(propertyValues);

    return this.assetRepository.findOneOrFail({
      where: { id: asset.id },
      relations: [
        'propertyValues',
        'propertyValues.property',
        'subCategory',
        'subCategory.category',
      ],
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
    employeeId?: string;
  },
): Promise<Pagination<Asset>> {
  const {
    search,
    subCategoryId,
    categoryId,
    status,
    employeeId,
    ...paginationOptions
  } = options;

  const queryBuilder = this.assetRepository.createQueryBuilder('asset')
    .leftJoinAndSelect('asset.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category');

  if (search) {
    queryBuilder.andWhere(
      '(asset.name LIKE :search OR asset.assetUuid LIKE :search OR asset.model LIKE :search OR asset.brand LIKE :search OR asset.code LIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (subCategoryId) {
    queryBuilder.andWhere('subCategory.subCategoryUuid = :subCategoryId', { subCategoryId });
  }

  if (categoryId) {
    queryBuilder.andWhere('category.categoryUuid = :categoryId', { categoryId });
  }

  if (status) {
    queryBuilder.andWhere('asset.status = :status', { status });
  }

  if (employeeId) {
    queryBuilder.andWhere(qb => {
      const subQuery = qb.subQuery()
        .select('ah.asset_id')
        .from('asset_holders', 'ah')
        .where('ah.employee_id = :employeeId')
        .andWhere('ah.returned_at IS NULL')
        .andWhere('ah.deleted_at IS NULL')
        .getQuery();
      return 'asset.id IN ' + subQuery;
    }).setParameter('employeeId', employeeId);

    queryBuilder.andWhere('category.hasHolder = :hasHolder', { hasHolder: true });
  }

  queryBuilder.orderBy('asset.createdAt', 'DESC');

  const paginationResult = await paginate<Asset>(queryBuilder, paginationOptions);

  if (paginationResult.items.length > 0) {
    const assetsWithRelations = await this.assetRepository.find({
      where: {
        assetUuid: In(paginationResult.items.map(a => a.assetUuid)),
      },
      relations: [
        'subCategory',
        'subCategory.category',
        'propertyValues',
        'propertyValues.property',
        'holderRecords',
        'holderRecords.employee',
      ],
      order: {
        holderRecords: { createdAt: 'DESC' },
      },
    });

    (paginationResult as any).items = await Promise.all(
      assetsWithRelations.map(async (asset) => {
        const hasHolder = asset.subCategory?.category?.hasHolder;
        return {
          ...asset,
          propertyValues: (asset.propertyValues || []).filter(pv => pv.property && !pv.property.deletedAt),
          activeHolder: hasHolder
            ? (asset.holderRecords || []).find(h => !h.returnedAt && !h.deletedAt) ?? null
            : null,
        };
      }),
    );
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

  /**
   * Find an asset by Asset Code
   * @param code - code of the asset
   * @returns Promise<Asset> - the found asset entity
   * @throws NotFoundException if the asset is not found
   */
  async findOneByCode(code: string): Promise<Asset> {
    return this.assetRepository.findOneByOrFail({ code });
  }

    /**
   * Soft delete a asset by UUID
   * @param uuid - UUID of the asset to delete
   * @param userId - ID of the user performing the deletion
   * @returns Promise<Asset> - the soft-deleted asset entity
   * @throws NotFoundException if asset is not found
   */
  async remove(uuid: string, userId: number) {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: uuid },
    });
    asset.deletedBy = userId;
    await this.assetRepository.save(asset);
    return await this.assetRepository.softRemove(asset);
  }

}
