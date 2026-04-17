import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository, In, IsNull } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { IPaginationOptions, paginate, Pagination, PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { StorageService } from '../../storage/storage.service';
import { LogAsset } from '../asset-log/decorator/log-asset.decorator';
import { AssetLogType } from '../asset-log/enum/asset-log.enum';
import { AssetLabel } from '../asset-label/entities/asset-label.entity';
import { AssetStatus } from '../asset-status/entities/asset-status.entity';
import { AssetStatusType } from '../asset-status/enum/asset-status.enum';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(AssetPropertyValue)
    private readonly assetPropertyValueRepository: Repository<AssetPropertyValue>,
    @InjectRepository(AssetLabel)
    private readonly assetLabelRepository: Repository<AssetLabel>,
    @InjectRepository(AssetStatus)
    private readonly assetStatusRepository: Repository<AssetStatus>,
    private storageService: StorageService,
  ) {}
  
  /**
   * Create a new asset
   * @param userId - ID user yang membuat asset
   * @param createAssetDto - DTO containing data to create an asset
   * @returns Promise<Asset> - the created asset entity
   */
  @LogAsset('Created a new asset', AssetLogType.ASSET)
  async create(userId: number, createAssetDto: CreateAssetDto): Promise<Asset> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: createAssetDto.subCategoryId },
      relations: ['assetProperties'],
    });

    const existingAsset = await this.assetRepository.findOne({
      where: { 
        code: createAssetDto.code,
        deletedAt: IsNull()
      },
    });
    if (existingAsset) {
      throw new BadRequestException(`Asset with code ${createAssetDto.code} already exists.`);      
    }

    let imagePath: string | undefined;
    if (createAssetDto.image) {
      imagePath = await this.storageService.uploadFile('image', createAssetDto.image);
    }

    let labels = createAssetDto.labels || [];
    if (typeof labels === 'string') {
      try {
        labels = JSON.parse(labels);
      } catch (e) {
        labels = [];
      }
    }

    const asset = this.assetRepository.create({
      subCategoryId: subCategory.id,
      code: createAssetDto.code,
      name: createAssetDto.name,
      description: createAssetDto.description,
      brand: createAssetDto.brand,
      model: createAssetDto.model,
      user: createAssetDto.user,
      price: createAssetDto.price,
      purchaseDate: createAssetDto.purchaseDate,
      isLendable: createAssetDto.isLendable ?? false,
      createdBy: userId,
      imagePath,
    });

    const savedAsset = await this.assetRepository.save(asset);

    if (createAssetDto.properties?.length) {
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
    }

    if (labels?.length) {
      const labelRecords = labels.map((l) => {
        return this.assetLabelRepository.create({
          assetId: savedAsset.id,
          key: l.key,
          value: l.value,
        });
      });
      await this.assetLabelRepository.save(labelRecords);
    }

    await this.assetStatusRepository.save(
      this.assetStatusRepository.create({
        assetId: savedAsset.id,
        type: AssetStatusType.ACTIVE,
        userId: userId,
      }),
    );

    const result = await this.assetRepository.findOneOrFail({
      where: { id: savedAsset.id },
      relations: [
        'propertyValues',
        'propertyValues.property',
        'subCategory',
        'subCategory.category',
        'labelRecords',
      ],
    });

    return result;
  }

  /**
   * Update an asset
   * @param assetId - ID asset yang akan diupdate
   * @param userId - ID user yang mengupdate
   * @param updateAssetDto - DTO containing data to update an asset
   * @returns Promise<Asset> - the updated asset entity
   */
  @LogAsset('Updated asset details', AssetLogType.ASSET)
  async update(assetId: string, userId: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
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

      let labels = updateAssetDto.labels || [];
      if (typeof labels === 'string') {
        try {
          labels = JSON.parse(labels);
        } catch (e) {
          console.error('Gagal parse labels saat update:', e);
          labels = [];
        }
      }

      asset.subCategoryId = subCategory.id;
      asset.code = updateAssetDto.code;
      asset.name = updateAssetDto.name;
      asset.description = updateAssetDto.description;
      asset.brand = updateAssetDto.brand;
      asset.model = updateAssetDto.model;
      asset.user = updateAssetDto.user;
      asset.price = updateAssetDto.price;
      asset.purchaseDate = updateAssetDto.purchaseDate;
      asset.isLendable = updateAssetDto.isLendable;
      asset.imagePath = imagePath || asset.imagePath;

      await this.assetRepository.save(asset);

      await this.assetPropertyValueRepository.delete({ assetId: asset.id });
      await this.assetLabelRepository.delete({ assetId: asset.id });

      if (updateAssetDto.properties?.length) {
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
            valueString: propertyDef.dataType === 'string' ? String(p.value) : null,
            valueInt: propertyDef.dataType === 'number' ? Number(p.value) : null,
            createdBy: userId,
          });
        });
        await this.assetPropertyValueRepository.save(propertyValues);
      }

      if (labels?.length) {
        const labelRecords = labels.map((l) => {
          return this.assetLabelRepository.create({
            assetId: asset.id,
            key: l.key,
            value: l.value,
          });
        });
        await this.assetLabelRepository.save(labelRecords);
      }

      return this.assetRepository.findOneOrFail({
        where: { id: asset.id },
        relations: [
          'propertyValues',
          'propertyValues.property',
          'subCategory',
          'subCategory.category',
          'labelRecords',
        ],
      });
    }

    /**
   * Paginate assets with optional search and filters by category or sub-category
   * @param options - Pagination options plus optional search string and/or sub-category/category UUIDs
   * @param filters - Optional filter object to narrow down the query.
   * @param filters.user - Employee UUID who currently holds the asset (optional)
   * @param filters.subCategoryId - Subcategory UUID (optional)
   * @param filters.categoryId - Category UUID (optional)
   * @param filters.status - Asset status (optional, e.g., 'active', 'maintenance', etc.)
   * @param filters.employeeId - Employee UUID who currently holds the asset (optional)
   * @param filters.locationId - Location UUID(s) where the asset is currently placed (optional, can be comma-separated)
   * @param filters.branchId - Branch UUID(s) where the asset is currently placed (optional, can be comma-separated)
   * @param filters.startDate - Start date filter for purchase date (optional, format: 'YYYY-MM-DD')
   * @param filters.endDate - End date filter for purchase date (optional, format: 'YYYY-MM-DD')
   * @param filters.hasHolder - Filter assets that have a current holder (optional, boolean)
   * @returns Promise<Pagination<Asset>> - paginated result of assets
   */
  async paginate(
    options: IPaginationOptions & {
      search?: string;
      user?: string;
      subCategoryId?: string;
      categoryId?: string;
      status?: string;
      employeeId?: string;
      locationId?: string;
      branchId?: string;
      startDate?: string;
      endDate?: string;
      hasHolder?: boolean;
      sort?: string;
      order?: 'ASC' | 'DESC';
      labels?: string;
    },
  ): Promise<Pagination<Asset>> {
    const { search, user, subCategoryId, categoryId, status, employeeId, locationId, branchId, startDate, endDate, hasHolder, labels, sort = 'purchaseDate', order = 'DESC', ...paginationOptions } = options;

    const queryBuilder = this.assetRepository.createQueryBuilder('asset');

    if (search) {
      queryBuilder.andWhere(
         `(asset.name LIKE :search OR asset.assetUuid LIKE :search OR asset.model LIKE :search OR asset.description LIKE :search 
          OR asset.brand LIKE :search OR asset.code LIKE :search OR asset.user LIKE :search 
          OR asset.price LIKE :search 
          OR asset.subCategoryId IN (SELECT sc.id FROM sub_categories sc WHERE sc.name LIKE :search)
          OR asset.subCategoryId IN (SELECT sc2.id FROM sub_categories sc2 INNER JOIN categories c ON sc2.category_id = c.id WHERE c.name LIKE :search)
          OR asset.id IN (SELECT ah.asset_id FROM asset_holders ah INNER JOIN employees e ON ah.employee_id = e.id_employee WHERE ah.returned_at IS NULL AND ah.deleted_at IS NULL AND e.full_name LIKE :search)
          OR asset.id IN (SELECT al.asset_id FROM asset_locations al INNER JOIN locations l ON al.location_id = l.id WHERE al.deleted_at IS NULL AND l.name LIKE :search)
          OR asset.id IN (SELECT lbl.asset_id FROM asset_labels lbl WHERE lbl.value LIKE :search)
         )`,
        { search: `%${search}%` },
      );
    }

    if (user) {
      queryBuilder.andWhere('asset.user = :user', { user });
    }

    if (subCategoryId) {
      queryBuilder.andWhere(`asset.subCategoryId IN (SELECT id FROM sub_categories WHERE sub_category_uuid = :subCategoryId)`, { subCategoryId });
    }

    if (categoryId) {
      queryBuilder.andWhere(`asset.subCategoryId IN (SELECT id FROM sub_categories WHERE category_id IN (SELECT id FROM categories WHERE category_uuid = :categoryId))`, { categoryId });
    }
    
    if (status) {
      queryBuilder.andWhere(
        `asset.id IN (
          SELECT as1.asset_id FROM asset_statuses as1
          WHERE as1.type = :status AND as1.created_at = (
            SELECT MAX(as2.created_at) FROM asset_statuses as2 WHERE as2.asset_id = as1.asset_id
          )
        )`,
        { status }
      );
    }

    if (employeeId) {
      queryBuilder.andWhere(
        `asset.id IN (SELECT ah.asset_id FROM asset_holders ah WHERE ah.employee_id = :employeeId AND ah.returned_at IS NULL AND ah.deleted_at IS NULL)`,
        { employeeId }
      );
    }

    if (hasHolder === true) {
      queryBuilder.andWhere(
        `asset.id IN (SELECT ah.asset_id FROM asset_holders ah WHERE ah.returned_at IS NULL AND ah.deleted_at IS NULL)`
      );
    }

    if (locationId) {
      const locationIds = locationId.split(',').map(id => id.trim());
      queryBuilder.andWhere(
        `asset.id IN (
          SELECT al1.asset_id FROM asset_locations al1
          INNER JOIN locations l ON al1.location_id = l.id
          WHERE al1.deleted_at IS NULL AND l.location_uuid IN (:...locationIds) AND al1.created_at = (
            SELECT MIN(al2.created_at) FROM asset_locations al2 WHERE al2.asset_id = al1.asset_id AND al2.deleted_at IS NULL
          )
        )`,
        { locationIds }
      );
    }

    if (branchId) {
      const branchIds = branchId.split(',').map(id => id.trim());
      queryBuilder.andWhere(
        `asset.id IN (
          SELECT al1.asset_id FROM asset_locations al1
          INNER JOIN locations l ON al1.location_id = l.id
          WHERE al1.deleted_at IS NULL AND l.branch_id IN (:...branchIds) AND al1.created_at = (
            SELECT MAX(al2.created_at) FROM asset_locations al2 WHERE al2.asset_id = al1.asset_id AND al2.deleted_at IS NULL
          )
        )`,
        { branchIds }
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('asset.purchaseDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      queryBuilder.andWhere('asset.purchaseDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('asset.purchaseDate <= :endDate', { endDate });
    }

    if (labels) {
      const labelFilters = labels.split(',');
      labelFilters.forEach((filter, index) => {
        let isNot = false;
        let key, value;

        if (filter.includes('!=')) {
          [key, value] = filter.split('!=');
          isNot = true;
        } else if (filter.includes('=')) {
          [key, value] = filter.split('=');
        } else return;

        key = key.trim();
        value = value.trim().replace(/\+/g, ' ');

        const operator = isNot ? 'NOT IN' : 'IN';
        queryBuilder.andWhere(
          `asset.id ${operator} (SELECT al.asset_id FROM asset_labels al WHERE al.key = :key${index} AND al.value = :value${index})`,
          { [`key${index}`]: key, [`value${index}`]: value }
        );
      });
    }

    const sortField = sort.includes('.') ? sort : `asset.${sort}`;
    queryBuilder.orderBy(sortField, order);

    const totalItems = await queryBuilder.getCount();

    const paginationResult = await paginate<Asset>(queryBuilder, {
      ...paginationOptions,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
      countQueries: false,
    });

    const limit = Number(paginationOptions.limit) || 10;
    paginationResult.meta.totalItems = totalItems;
    paginationResult.meta.totalPages = Math.ceil(totalItems / limit);

    if (paginationResult.items.length > 0) {
      const assetsWithRelations = await this.assetRepository.createQueryBuilder('asset')
        .leftJoinAndSelect('asset.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('asset.holderRecords', 'holderRecords')
        .leftJoinAndSelect('holderRecords.employee', 'employee')
        .leftJoinAndSelect('asset.locationRecords', 'locationRecords')
        .leftJoinAndSelect('locationRecords.location', 'location')
        .leftJoinAndSelect('location.branch', 'branch')
        .leftJoinAndSelect('asset.statusRecords', 'statusRecords')
        .leftJoinAndSelect('statusRecords.user', 'statusUser')
        .where('asset.assetUuid IN (:...assetUuids)', { assetUuids: paginationResult.items.map(a => a.assetUuid) })
        .orderBy(sortField, order)
        .getMany();

      (paginationResult as any).items = assetsWithRelations.map((asset) => {
        const hasHolder = asset.subCategory?.category?.hasHolder;
        const hasLocation = asset.subCategory?.category?.hasLocation;
        return {
          ...asset,
          propertyValues: (asset.propertyValues || []).filter(pv => pv.property && !pv.property.deletedAt),
          activeHolder: hasHolder
            ? (asset.holderRecords || []).find(h => !h.returnedAt && !h.deletedAt) ?? null
            : null,
          lastLocation: hasLocation
            ? (asset.locationRecords || []).find(l => !l.deletedAt)?.location ?? null
            : null,
          lastStatus: (asset.statusRecords || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null,
          labels: asset.labelRecords || [],
          activeHolderEmployee: asset.activeHolder ? asset.activeHolder.employee : null,
        };
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
  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: id },
      relations: [
        'propertyValues',
        'propertyValues.property',
        'subCategory',
        'subCategory.category',
        'labelRecords',
        'statusRecords',
        'statusRecords.user',
      ],
    });

    const hasHolder = asset.subCategory?.category?.hasHolder;
    const hasLocation = asset.subCategory?.category?.hasLocation;

    return {
      ...asset,
      propertyValues: (asset.propertyValues || []).filter(pv => pv.property && !pv.property.deletedAt),
      activeHolder: hasHolder
        ? (asset.holderRecords || []).find(h => !h.returnedAt && !h.deletedAt) ?? null
        : null,
      lastLocation: hasLocation
        ? (asset.locationRecords || []).find(l => !l.deletedAt)?.location ?? null
        : null,
      lastStatus: (asset.statusRecords || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null,
      labels: asset.labelRecords || [],
    } as any;
  }


  /**
   * Find an asset by Asset Code
   * @param code - code of the asset
   * @retu  rns Promise<Asset> - the found asset entity
   * @throws NotFoundException if the asset is not found
   */
  async findOneByCode(code: string): Promise<Asset> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { code },
      relations: [
        'propertyValues',
        'propertyValues.property',
        'subCategory',
        'subCategory.category',
        'labelRecords',
        'statusRecords',
        'statusRecords.user',
      ],
    });

    const hasHolder = asset.subCategory?.category?.hasHolder;
    const hasLocation = asset.subCategory?.category?.hasLocation;

    return {
      ...asset,
      propertyValues: (asset.propertyValues || []).filter(pv => pv.property && !pv.property.deletedAt),
      activeHolder: hasHolder
        ? (asset.holderRecords || []).find(h => !h.returnedAt && !h.deletedAt) ?? null
        : null,
      lastLocation: hasLocation
        ? (asset.locationRecords || []).find(l => !l.deletedAt)?.location ?? null
        : null,
      lastStatus: (asset.statusRecords || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null,
      labels: asset.labelRecords || [],
    } as any;
  }

    /**
   * Soft delete a asset by UUID
   * @param uuid - UUID of the asset to delete
   * @returns Promise<Asset> - the soft-deleted asset entity
   * @throws NotFoundException if asset is not found
   */
  @LogAsset('Removed asset', AssetLogType.ASSET)
  async remove(uuid: string) {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: uuid },
    });
    return await this.assetRepository.softRemove(asset);
  }
}
