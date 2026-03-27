import { Injectable } from '@nestjs/common';
import { AssetLog } from './entities/asset-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssetLogService {
  constructor(
      @InjectRepository(AssetLog)
      private readonly assetLogRepository: Repository<AssetLog>,
      @InjectRepository(Asset)
      private readonly assetRepository: Repository<Asset>
    ) {}
    
  /**
     * Create a new asset log record
     * @param userId - ID of the user creating the record
     * @param assetUuid - UUID of the asset
     * @param message - message of the log
     * @returns Promise<AssetLog> - the created asset log record
     */
    async create(
      userId: number,
      assetUuid: string,
      message: string,
      type: string,
    ): Promise<AssetLog> {
      const asset = await this.assetRepository.findOneOrFail({
        where: { assetUuid: assetUuid }
      });
      const assetLog = this.assetLogRepository.create({
        userId: userId,
        message: message,
        type: type,
        assetId: asset.id,
        createdAt: new Date(),
      });
      return this.assetLogRepository.save(assetLog);
    }

  /**
   * Find all asset log records by asset UUID
   * @param assetUuid - UUID of the asset
   * @returns Promise<AssetLog[]> - the found asset log records
   */
  async findAll(assetUuid: string): Promise<AssetLog[]> {
    const assetLogs = await this.assetLogRepository.find({
      where: { asset: { assetUuid: assetUuid } },
      relations: ['user'],
    });
    return assetLogs;
  }
}
