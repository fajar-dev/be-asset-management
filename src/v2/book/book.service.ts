import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/v1/asset/entities/asset.entity';
import { Repository } from 'typeorm';
import { AssetHolder } from 'src/v1/asset-holder/entities/asset-holder.entity';
import { AssetHolderService } from 'src/v1/asset-holder/asset-holder.service';
import { User } from 'src/v1/user/entities/user.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly assetHolderService: AssetHolderService,
  ) {}

  async findAll(search?: string, hasHolder?: boolean | string): Promise<Asset[]> {
    const qb = this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('asset.holderRecords', 'holderRecords')
      .leftJoinAndSelect('holderRecords.employee', 'employee')
      .where('category.name = :categoryName', { categoryName: 'Buku' })
      .andWhere('asset.deletedAt IS NULL')
      .andWhere('asset.isLendable = :isLendable', { isLendable: true });

    if (search) {
      qb.andWhere('asset.name LIKE :search', { search: `%${search}%` });
    }

    if (hasHolder !== undefined && hasHolder !== '') {
      const isTrue = String(hasHolder) === 'true';
      const subQuery = qb.subQuery()
        .select('ah.assetId')
        .from(AssetHolder, 'ah')
        .where('ah.returnedAt IS NULL')
        .andWhere('ah.deletedAt IS NULL')
        .getQuery();

      if (isTrue) {
        qb.andWhere(`asset.id IN (${subQuery})`);
      } else {
        qb.andWhere(`asset.id NOT IN (${subQuery})`);
      }
    }

    const assets = await qb.getMany();

    return assets.map((asset) => {
      const hasHolder = asset.subCategory?.category?.hasHolder;

      return {
        ...asset,
        activeHolder: hasHolder
          ? (asset.holderRecords || []).find((h) => !h.returnedAt && !h.deletedAt) ?? null
          : null,
      } as any;
    });
  }

  async findOne(uuid: string): Promise<Asset> {
    const asset = await this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('asset.holderRecords', 'holderRecords')
      .leftJoinAndSelect('holderRecords.employee', 'employee')
      .where('asset.assetUuid = :uuid', { uuid })
      .andWhere('category.name = :categoryName', { categoryName: 'Buku' })
      .getOneOrFail();

    const hasHolder = asset.subCategory?.category?.hasHolder;

    return {
      ...asset,
      activeHolder: hasHolder
        ? (asset.holderRecords || []).find((h) => !h.returnedAt && !h.deletedAt) ?? null
        : null,
    } as any;
  }

  async assign(user: User, body: any) {
    return await this.assetHolderService.assign(user.id, body.assetId, {
      employeeId: body.employeeId,
      purpose: body.purpose,
      assignedAt: new Date(),
      isRequest: true
    });
  }
}
