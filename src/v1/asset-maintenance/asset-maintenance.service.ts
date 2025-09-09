import { Injectable } from '@nestjs/common';
import { CreateAssetMaintenanceDto } from './dto/create-asset-maintenance.dto';
import { UpdateAssetMaintenanceDto } from './dto/update-asset-maintenance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetMaintenanceService {
  constructor(
    @InjectRepository(AssetMaintenance)
    private readonly assetMaintenanceRepository: Repository<AssetMaintenance>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>
  ) {}
    
  /**
   * Create a new asset maintenance record
   * @param userId - ID of the user creating the record
   * @param assetUuid - UUID of the asset
   * @param assetMaintenanceDto - DTO containing maintenance data
   * @returns Promise<AssetMaintenance> - the created asset maintenance record
   */
  async create(
    userId: number,
    assetUuid: string,
    assetMaintenanceDto: CreateAssetMaintenanceDto,
  ): Promise<AssetMaintenance> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: assetUuid }
    });
    const maintenance = this.assetMaintenanceRepository.create({
      maintenanceAt: assetMaintenanceDto.maintenanceAt,
      note: assetMaintenanceDto.note,
      assetId: asset.id,
      createdBy: userId,
    });
    return this.assetMaintenanceRepository.save(maintenance);
  }

  /**
   * Paginate asset maintenance records
   * @param options - Pagination options with optional search string
   * @returns Promise<Pagination<AssetMaintenance>> - paginated result of asset maintenance records
   */
  async paginate(
  options: IPaginationOptions & { search?: string; assetUuid: string },
  ): Promise<Pagination<AssetMaintenance>> {
    const queryBuilder = this.assetMaintenanceRepository
      .createQueryBuilder('am')
      .leftJoinAndSelect('am.asset', 'asset')
      .where('asset.assetUuid = :assetUuid', { assetUuid: options.assetUuid });

    if (options.search && options.search.trim() !== '') {
      queryBuilder.andWhere('LOWER(am.notes) LIKE :search', {
        search: `%${options.search.toLowerCase()}%`,
      });
    }

    queryBuilder.orderBy('am.maintenanceAt', 'DESC');

    return paginate<AssetMaintenance>(queryBuilder, {
      limit: options.limit,
      page: options.page,
    });
  }

  /**
   * Find a specific asset maintenance record by UUID and asset UUID
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the maintenance record
   * @returns Promise<AssetMaintenance> - the found asset maintenance record
   */
  async findOne(assetUuid: string, uuid: string): Promise<AssetMaintenance> {
    return await this.assetMaintenanceRepository.findOneOrFail({
      where: {
        assetMaintenanceUuid: uuid,
        asset: { assetUuid },
      },
    });
  }
  
  /**
   * Update an existing asset maintenance record
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the maintenance record to update
   * @param userId - ID of the user performing the update
   * @param updateAssetMaintenanceDto - DTO containing updated maintenance data
   * @returns Promise<AssetMaintenance> - the updated asset maintenance record
   */
  async update(
    assetUuid: string,
    uuid: string,
    userId: number,
    updateAssetMaintenaceDto: UpdateAssetMaintenanceDto,
  ): Promise<AssetMaintenance> {
    const assetMaintenance = await this.assetMaintenanceRepository.findOneOrFail({
      where: {
        assetMaintenanceUuid: uuid,
        asset: { assetUuid },
      },
    });
    assetMaintenance.maintenanceAt = updateAssetMaintenaceDto.maintenanceAt;
    assetMaintenance.note = updateAssetMaintenaceDto.note;
    assetMaintenance.updatedBy = userId;
    return this.assetMaintenanceRepository.save(assetMaintenance);
  }
  
  /**
   * Soft delete an asset maintenance record
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the maintenance record to delete
   * @param userId - ID of the user performing the deletion
   * @returns Promise<AssetMaintenance> - the soft-deleted asset maintenance record
   */
  async remove(assetUuid: string, uuid: string, userId: number) {
    const assetMaintenance = await this.assetMaintenanceRepository.findOneOrFail({
      where: {
        assetMaintenanceUuid: uuid,
        asset: { assetUuid },
      },
    });
    assetMaintenance.deletedBy = userId;
    await this.assetMaintenanceRepository.save(assetMaintenance);
    return await this.assetMaintenanceRepository.softRemove(assetMaintenance);
  }
}