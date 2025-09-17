import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AssetHolder } from './entities/asset-holder.entity';
import { Asset } from '../asset/entities/asset.entity';
import { assignedAssetHolderDto } from './dto/assigned-asset-holder.dto';
import { returnedAssetHolderDto } from './dto/returned-asset-holder.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetHolderService {
  constructor(
    @InjectRepository(AssetHolder)
    private readonly assetHolderRepository: Repository<AssetHolder>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>
  ) {}

  /**
   * Assigns an asset to a holder.
   * @param userId - ID of the user assigning the asset
   * @param assetUuid - UUID of the asset
   * @param assignAssetHolderDto - DTO containing assignment details
   * @returns Promise<Boolean> - boolean indicating success or failure
   */
  async assign(
    userId: number,
    assetUuid: string,
    assignAssetHolderDto: assignedAssetHolderDto,
  ): Promise<Boolean> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid }
    });

    if (asset.status !== 'active') {
      return false;
    }

    const lastAssignment = await this.assetHolderRepository.findOne({
      where: { assetId: asset.id },
      order: { createdAt: 'DESC' }
    });

    if (lastAssignment && !lastAssignment.returnedAt) {
      return false;
    }

    const assetHolder = this.assetHolderRepository.create({
      assetId: asset.id,
      employeeId: assignAssetHolderDto.employeeId,
      assignedAt: assignAssetHolderDto.assignedAt,
      purpose: assignAssetHolderDto.purpose,
      createdBy: userId
    });

    await this.assetHolderRepository.save(assetHolder);
    return true;
  }

  /**
   * Marks an asset as returned by a holder.
   * @param assetUuid - UUID of the asset
   * @returns Promise<Boolean> - boolean indicating success or failure
   */
  async return(
    userId: number,
    assetUuid: string,
    assetHolder: string,
    returnedAssetHolderDto: returnedAssetHolderDto,
  ): Promise<Boolean> {
    const asset = await this.assetRepository.findOneOrFail({
      where: {assetUuid : assetUuid}
    })
    const lastAssignment = await this.assetHolderRepository.findOne({
        where: { assetHolderUuid: assetHolder, assetId: asset.id, returnedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });

    if (!lastAssignment) {
      return false
    }

    lastAssignment.returnedAt = returnedAssetHolderDto.returnedAt
    lastAssignment.updatedBy = userId
    await this.assetHolderRepository.save(lastAssignment);
    return true;
  }

  /**
   * Paginate asset maintenance records
   * @param options - Pagination options with optional search string
   * @returns Promise<Pagination<AssetMaintenance>> - paginated result of asset maintenance records
  */
  async paginate(
    options: IPaginationOptions & { search?: string; assetUuid: string },
  ): Promise<Pagination<AssetHolder>> {
    const queryBuilder = this.assetHolderRepository
      .createQueryBuilder('ah')
      .leftJoinAndSelect('ah.asset', 'asset')
      .where('asset.assetUuid = :assetUuid', { assetUuid: options.assetUuid });
    if (options.search && options.search.trim() !== '') {
      queryBuilder.andWhere('LOWER(ah.employeeId) LIKE :search', {
        search: `%${options.search.toLowerCase()}%`,
      });
    }
    queryBuilder.orderBy('ah.assignedAt', 'DESC');
    return paginate<AssetHolder>(queryBuilder, {
      limit: options.limit,
      page: options.page,
    });
  }
}
  