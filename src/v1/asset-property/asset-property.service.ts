import { Injectable } from '@nestjs/common';
import { CreateAssetPropertyDto } from './dto/create-asset-property.dto';
import { UpdateAssetPropertyDto } from './dto/update-asset-property.dto';
import { AssetProperty } from './entities/asset-property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetPropertyService {
  constructor(
    @InjectRepository(AssetProperty)
    private readonly assetPropertyRepository: Repository<AssetProperty>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>
  ) {}
  
  /**
    * Create a new sub category
    * @param createCategorydto - DTO containing data to create a sub category
    * @returns Promise<SubCategory> - the created sub category entity
  */
  async create(
    userId: number,
    subCategoryUuid: string,
    subCreateCategorydto: CreateAssetPropertyDto,
  ): Promise<AssetProperty> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: subCategoryUuid }
    });
    const assetProperty = this.assetPropertyRepository.create({
      name: subCreateCategorydto.name,
      dataType: subCreateCategorydto.dataType,
      subCategoryId: subCategory.id,
      createdBy: userId,
    });
    return this.assetPropertyRepository.save(assetProperty);
  }
  
  /**
   * Paginate asset properties for sub category
   * @param options - Pagination options plus optional search string
   * @returns Promise<Pagination<AssetProperty>> - paginated result of asset properties
   */
  async paginate(
    options: IPaginationOptions & { search?: string, subCategoryUuid: string },
  ): Promise<Pagination<AssetProperty>> {
    const queryBuilder = this.assetPropertyRepository
    .createQueryBuilder('ap')
    .leftJoinAndSelect('ap.subCategory', 'sc');

    if (options.search) {
      queryBuilder.andWhere('LOWER(ap.name) LIKE :search', {
        search: `%${options.search.toLowerCase()}%`,
      });
    }

    if (options.subCategoryUuid) {
      queryBuilder.andWhere('sc.subCategoryUuid = :subCategoryUuid', {
        subCategoryUuid: options.subCategoryUuid,
      });
    }
    return paginate<AssetProperty>(queryBuilder, {
      limit: options.limit || 10,
      page: options.page || 1,
    });
  }
  
  
/**
 * Find an asset property by UUID and subCategory
 * @param subCategoryUuid - UUID of the sub category
 * @param uuid - UUID of the asset property
 * @returns Promise<AssetProperty> - the found asset property entity
 */
  async findOne(subCategoryUuid: string, uuid: string): Promise<AssetProperty> {
    return await this.assetPropertyRepository.findOneOrFail({
      where: {
        assetPropertyUuid: uuid,
        subCategory: { subCategoryUuid },
      },
    });
  }

/**
 * Update a asset property on sub category by UUID
 * @param subCategoryUuid - UUID of the sub category
 * @param uuid - UUID of the asset property to update
 * @param userId - ID of the user performing the update
 * @param UpdateAssetPropertyDto - DTO containing updated asset property on sub category data
 * @returns Promise<AssetProperty> - the updated asset property entity
 */
  async update(
    subCategoryUuid: string,
    uuid: string,
    userId: number,
    updateAssetPropertyDto: UpdateAssetPropertyDto,
  ): Promise<AssetProperty> {
    const assetProperty = await this.assetPropertyRepository.findOneOrFail({
      where: {
        assetPropertyUuid: uuid,
        subCategory: { subCategoryUuid },
      },
    });
    assetProperty.name = updateAssetPropertyDto.name
    assetProperty.dataType = updateAssetPropertyDto.dataType
    assetProperty.updatedBy = userId
    return this.assetPropertyRepository.save(assetProperty);
  }

  /**
   * Soft delete a asset property on sub category by UUID
   * @param subCategoryUuid - UUID of the sub category
   * @param uuid - UUID of the asset property to delete
   * @returns Promise<import("typeorm").UpdateResult> - result of soft delete operation
   */
  async remove(subCategoryUuid: string, uuid: string, userId: number) {
    const assetProperty = await this.assetPropertyRepository.findOneOrFail({
      where: {
        assetPropertyUuid: uuid,
        subCategory: { subCategoryUuid },
      },
    });
    assetProperty.deletedBy = userId;
    await this.assetPropertyRepository.save(assetProperty);
    return await this.assetPropertyRepository.softRemove(assetProperty);
  }
}
