import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAssetLabelDto } from './dto/create-asset-label.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetLabel } from './entities/asset-label.entity';
import { Repository } from 'typeorm';
import { Asset } from '../asset/entities/asset.entity';

@Injectable()
export class AssetLabelService {
  constructor(
    @InjectRepository(AssetLabel)
    private readonly assetLabelRepository: Repository<AssetLabel>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>
  ) {}

  async create(assetUuid: string, createAssetLabelDto: CreateAssetLabelDto): Promise<AssetLabel> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid }
    });
    
    const existingLabel = await this.assetLabelRepository.findOne({
      where: {
        assetId: asset.id,
        key: createAssetLabelDto.key,
        value: createAssetLabelDto.value,
      }
    });

    if (existingLabel) {
      throw new BadRequestException(`Label with key '${createAssetLabelDto.key}' and value '${createAssetLabelDto.value}' already exists for this asset`);
    }

    const label = this.assetLabelRepository.create({
      key: createAssetLabelDto.key,
      value: createAssetLabelDto.value,
      assetId: asset.id,
    });
    return this.assetLabelRepository.save(label);
  }

  async findAll(assetUuid: string): Promise<AssetLabel[]> {
    return await this.assetLabelRepository.find({
      where: {
        asset: { assetUuid },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async checkLabel(assetUuid: string, key: string, value: string): Promise<{ isAvailable: boolean }> {
    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid }
    });

    const existingLabel = await this.assetLabelRepository.findOne({
      where: {
        assetId: asset.id,
        key: key,
        value: value,
      }
    });

    return {
      isAvailable: !existingLabel
    };
  }

  async findAllUnique(search?: string): Promise<{ key: string, value: string }[]> {
    const query = this.assetLabelRepository.createQueryBuilder('label')
      .select(['label.key as `key`', 'label.value as `value`'])
      .groupBy('label.key')
      .addGroupBy('label.value');

    if (search) {
      query.where('label.key LIKE :search OR label.value LIKE :search', { search: `%${search}%` });
    }

    return await query.getRawMany();
  }
}

