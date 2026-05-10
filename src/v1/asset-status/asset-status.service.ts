import { Injectable } from '@nestjs/common';
import { CreateAssetStatusDto } from './dto/create-asset-status.dto';
import { AssetStatus } from './entities/asset-status.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { LogAsset } from '../asset-log/decorator/log-asset.decorator';
import { AssetLogType } from '../asset-log/enum/asset-log.enum';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class AssetStatusService {
  constructor(
    @InjectRepository(AssetStatus)
    private readonly assetStatusRepository: Repository<AssetStatus>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly storageService: StorageService,
  ) {}

  @LogAsset(async (args, result, ctx) => {
    const dto = args[2];
    return `Changed asset status to ${dto.type}`;
  }, AssetLogType.ASSET)
  async create(
    userId: number,
    assetUuid: string,
    createAssetStatusDto: CreateAssetStatusDto,
  ): Promise<AssetStatus> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid },
    });

    const uploadedPaths: string[] = [];
    if (createAssetStatusDto.attachments?.length) {
      const results = await Promise.all(
        createAssetStatusDto.attachments.map(file =>
          this.storageService.uploadFile('asset-status', file),
        ),
      );
      uploadedPaths.push(...results.filter((p): p is string => !!p));
    }

    const status = this.assetStatusRepository.create({
      assetId: asset.id,
      userId,
      type: createAssetStatusDto.type,
      note: createAssetStatusDto.note,
      isTransferred: createAssetStatusDto.isTransferred ?? false,
      attachmentPaths: uploadedPaths,
    });

    return this.assetStatusRepository.save(status);
  }

  async paginate(
    options: IPaginationOptions & { search?: string; assetUuid: string },
  ): Promise<Pagination<AssetStatus>> {
    const queryBuilder = this.assetStatusRepository
      .createQueryBuilder('as')
      .leftJoinAndSelect('as.asset', 'asset')
      .leftJoinAndSelect('as.user', 'user')
      .where('asset.assetUuid = :assetUuid', { assetUuid: options.assetUuid });

    if (options.search && options.search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(as.note) LIKE :search OR LOWER(as.type) LIKE :search)',
        { search: `%${options.search.toLowerCase()}%` },
      );
    }

    queryBuilder.orderBy('as.createdAt', 'DESC');

    return paginate<AssetStatus>(queryBuilder, options);
  }
}
