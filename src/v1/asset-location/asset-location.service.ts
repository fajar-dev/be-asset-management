import { Injectable } from '@nestjs/common';
import { CreateAssetLocationDto } from './dto/create-asset-location.dto';
import { UpdateAssetLocationDto } from './dto/update-asset-location.dto';
import { AssetLocation } from './entities/asset-location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Location } from '../location/entities/location.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetLocationService {   
  constructor(
    @InjectRepository(AssetLocation)
    private readonly assetLocationRepository: Repository<AssetLocation>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
  ) {}

  /**
   * Create a new asset-location record
   * @param userId - ID of the user creating the record
   * @param assetUuid - UUID of the asset
   * @param createAssetLocationDto - DTO containing the target location UUID
   * @returns Promise<AssetLocation> - the created asset-location entity
   */
  async create(
    userId: number,
    assetUuid: string,
    createAssetLocationDto: CreateAssetLocationDto,
  ): Promise<AssetLocation> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: assetUuid }
    });
    const location = await this.locationRepository.findOneOrFail({
      where: { locationUuid: createAssetLocationDto.locationId }
    });
    const assetProperty = this.assetLocationRepository.create({
      assetId: asset.id,
      locationId: location.id,
      createdBy: userId,
    });
    return this.assetLocationRepository.save(assetProperty);
  }

  /**
   * Paginate asset-location records
   * @param options - Pagination options with optional search string
   * @returns Promise<Pagination<AssetLocation>> - paginated result of asset-location records
   */
  async paginate(
    options: IPaginationOptions & { search?: string; assetUuid: string },
  ): Promise<Pagination<AssetLocation>> {
    const queryBuilder = this.assetLocationRepository
      .createQueryBuilder('al')
      .leftJoinAndSelect('al.asset', 'asset')
      .leftJoinAndSelect('al.location', 'location')
      .where('asset.assetUuid = :assetUuid', { assetUuid: options.assetUuid });

    if (options.search && options.search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(location.name) LIKE :search)',
        { search: `%${options.search.toLowerCase()}%` },
      );
    }

    queryBuilder.orderBy('al.createdAt', 'DESC');

    return paginate<AssetLocation>(queryBuilder, {
      limit: options.limit,
      page: options.page,
    });
  }
}
