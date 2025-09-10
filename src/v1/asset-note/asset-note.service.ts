import { Injectable } from '@nestjs/common';
import { CreateAssetNoteDto } from './dto/create-asset-note.dto';
import { UpdateAssetNoteDto } from './dto/update-asset-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetNote } from './entities/asset-note.entity';
import { Repository } from 'typeorm';
import { AssetMaintenance } from '../asset-maintenance/entities/asset-maintenance.entity';
import { Asset } from '../asset/entities/asset.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetNoteService {
  constructor(
    @InjectRepository(AssetNote)
    private readonly assetNoteRepository: Repository<AssetNote>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>
  ) {}

  /**
   * Create a new asset note record
   * @param userId - ID of the user creating the record
   * @param assetUuid - UUID of the asset
   * @param createAssetNoteDto - DTO containing note data
   * @returns Promise<AssetNote> - the created asset note record
   */
  async create(
    userId: number,
    assetUuid: string,
    createAssetNoteDto: CreateAssetNoteDto,
  ): Promise<AssetNote> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: assetUuid }
    });
    const assetNote = this.assetNoteRepository.create({
      note: createAssetNoteDto.note,
      occuredAt: createAssetNoteDto.occuredAt,
      assetId: asset.id,
      createdBy: userId,
    });
    return this.assetNoteRepository.save(assetNote);
  }
  
  /**
   * Paginate asset note records
   * @param options - Pagination options with optional search string
   * @returns Promise<Pagination<AssetNote>> - paginated result of asset note records
   */
  async paginate(
  options: IPaginationOptions & { search?: string; assetUuid: string },
  ): Promise<Pagination<AssetNote>> {
    const queryBuilder = this.assetNoteRepository
      .createQueryBuilder('an')
      .leftJoinAndSelect('an.asset', 'asset')
      .where('asset.assetUuid = :assetUuid', { assetUuid: options.assetUuid });

    if (options.search && options.search.trim() !== '') {
      queryBuilder.andWhere('LOWER(an.note) LIKE :search', {
        search: `%${options.search.toLowerCase()}%`,
      });
    }

    queryBuilder.orderBy('an.occuredAt', 'DESC');

    return paginate<AssetNote>(queryBuilder, {
      limit: options.limit,
      page: options.page,
    });
  }
  
  /**
   * Update an existing asset note record
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the note record to update
   * @param userId - ID of the user performing the update
   * @param updateAssetNoteDto - DTO containing updated note data
   * @returns Promise<AssetNote> - the updated asset note record
   */
  async update(
    assetUuid: string,
    uuid: string,
    userId: number,
    updateAssetNoteDto: UpdateAssetNoteDto,
  ): Promise<AssetNote> {
    const assetNote = await this.assetNoteRepository.findOneOrFail({
      where: {
        assetNoteUuid: uuid,
        asset: { assetUuid: assetUuid },
      },
    });
    assetNote.note = updateAssetNoteDto.note;
    assetNote.occuredAt = updateAssetNoteDto.occuredAt;
    assetNote.updatedBy = userId;
    return this.assetNoteRepository.save(assetNote);
  }

  /**
   * Find a specific asset note record by UUID and asset UUID
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the note record
   * @returns Promise<AssetNote> - the found asset note record
   */
  async findOne(assetUuid: string, uuid: string): Promise<AssetNote> {
    return await this.assetNoteRepository.findOneOrFail({
      where: {
        assetNoteUuid: uuid,
        asset: { assetUuid },
      },
    });
  }

  /**
   * Soft delete an asset note record
   * @param assetUuid - UUID of the asset
   * @param uuid - UUID of the note record to delete
   * @param userId - ID of the user performing the deletion
   * @returns Promise<AssetNote> - the soft-deleted asset note record
   */
  async remove(assetUuid: string, uuid: string, userId: number): Promise<AssetNote> {
    const assetNote = await this.assetNoteRepository.findOneOrFail({
      where: {
        assetNoteUuid: uuid,
        asset: { assetUuid },
      },
    });
    assetNote.deletedBy = userId;
    await this.assetNoteRepository.save(assetNote);
    return await this.assetNoteRepository.softRemove(assetNote);
  }
}
