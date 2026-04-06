import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/v1/asset/entities/asset.entity';
import { Repository } from 'typeorm';
import { AssetHolder } from 'src/v1/asset-holder/entities/asset-holder.entity';
import { AssetHolderService } from 'src/v1/asset-holder/asset-holder.service';
import { User } from 'src/v1/user/entities/user.entity';
import { ReturnBookDto } from './dto/return-book.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetHolder)
    private readonly assetHolderRepository: Repository<AssetHolder>,
    private readonly assetHolderService: AssetHolderService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(search?: string, hasHolder?: boolean | string, branchId?: string): Promise<Asset[]> {
    const qb = this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('asset.holderRecords', 'holderRecords')
      .leftJoinAndSelect('holderRecords.employee', 'employee')
      .leftJoinAndSelect('asset.locationRecords', 'locationRecords')
      .leftJoinAndSelect('locationRecords.location', 'location')
      .leftJoinAndSelect('location.branch', 'branch')
      .where('category.name = :categoryName', { categoryName: 'Buku' })
      .andWhere('asset.deletedAt IS NULL')
      .andWhere('asset.isLendable = :isLendable', { isLendable: true })
      .addOrderBy('locationRecords.createdAt', 'DESC');

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
    if (branchId) {
      const branchIds = branchId.split(',').map((id) => id.trim());
      qb.andWhere((subQb) => {
        const subQuery = subQb
          .subQuery()
          .select('al.asset_id')
          .from('asset_locations', 'al')
          .leftJoin('locations', 'l', 'al.location_id = l.id')
          .where('al.deletedAt IS NULL')
          .andWhere('l.branch_id IN (:...branchIds)')
          .andWhere((qb2) => {
            const lastLocSub = qb2
              .subQuery()
              .select('MAX(al2.createdAt)')
              .from('asset_locations', 'al2')
              .where('al2.asset_id = al.asset_id')
              .andWhere('al2.deletedAt IS NULL')
              .getQuery();
            return 'al.createdAt = ' + lastLocSub;
          })
          .getQuery();

        return 'asset.id IN ' + subQuery;
      }).setParameter('branchIds', branchIds);
    }

    const assets = await qb.getMany();

    return assets.map((asset) => {
      const hasHolder = asset.subCategory?.category?.hasHolder;
      const hasLocation = asset.subCategory?.category?.hasLocation;

      return {
        ...asset,
        activeHolder: hasHolder
          ? (asset.holderRecords || []).find((h) => !h.returnedAt && !h.deletedAt) ?? null
          : null,
        lastLocation: hasLocation
          ? (asset.locationRecords || [])
              .filter((l) => !l.deletedAt)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.location ?? null
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
      .leftJoinAndSelect('asset.locationRecords', 'locationRecords')
      .leftJoinAndSelect('locationRecords.location', 'location')
      .leftJoinAndSelect('location.branch', 'branch')
      .where('asset.assetUuid = :uuid', { uuid })
      .andWhere('category.name = :categoryName', { categoryName: 'Buku' })
      .addOrderBy('locationRecords.createdAt', 'DESC')
      .getOneOrFail();

    const hasHolder = asset.subCategory?.category?.hasHolder;
    const hasLocation = asset.subCategory?.category?.hasLocation;

    return {
      ...asset,
      activeHolder: hasHolder
        ? (asset.holderRecords || []).find((h) => !h.returnedAt && !h.deletedAt) ?? null
        : null,
      lastLocation: hasLocation
        ? (asset.locationRecords || [])
            .filter((l) => !l.deletedAt)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.location ?? null
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

  async return(user: User, body: ReturnBookDto) {
    return await this.assetHolderService.return(user.id, body.assetId, body.assetHolderId, {
      returnedAt: new Date(),
    }, body.employeeId);
  }

  async findLoansByEmployee(employeeId: string, hasReturn?: boolean | string) {
    const qb = this.assetHolderRepository.createQueryBuilder('ah')
      .leftJoinAndSelect('ah.asset', 'asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('ah.employeeId = :employeeId', { employeeId })
      .andWhere('category.name = :categoryName', { categoryName: 'Buku' });

    if (hasReturn !== undefined && hasReturn !== '') {
      const isTrue = String(hasReturn) === 'true';
      if (isTrue) {
        qb.andWhere('ah.returnedAt IS NOT NULL');
      } else {
        qb.andWhere('ah.returnedAt IS NULL');
      }
    }

    return await qb.orderBy('ah.assignedAt', 'DESC').getMany();
  }

  async findAllLoans(search?: string, startDate?: string, endDate?: string) {
    const qb = this.assetHolderRepository.createQueryBuilder('ah')
      .leftJoinAndSelect('ah.asset', 'asset')
      .leftJoinAndSelect('ah.employee', 'employee')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('category.name = :categoryName', { categoryName: 'Buku' })
      .andWhere('ah.returnedAt IS NOT NULL');

    if (search) {
      qb.andWhere('(employee.fullName LIKE :search OR employee.idEmployee LIKE :search OR asset.name LIKE :search)', { search: `%${search}%` });
    }

    if (startDate && endDate) {
      qb.andWhere('ah.returnedAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      qb.andWhere('ah.returnedAt >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('ah.returnedAt <= :endDate', { endDate });
    }

    const loans = await qb.orderBy('ah.assignedAt', 'DESC').getMany();

    const employeeLoans: Record<string, any> = {};

    for (const loan of loans) {
      const empId = loan.employee.idEmployee;
      if (!employeeLoans[empId]) {
        employeeLoans[empId] = {
          employee: loan.employee.fullName,
          bookLoans: {}
        };
      }

      const bookImageUrl = loan.asset.imagePath ? await this.storageService.getPreSignedUrl(loan.asset.imagePath) : null;
      const attachments = loan.attachmentPaths || [];
      const loanPhoto = attachments[0] ? await this.storageService.getPreSignedUrl(attachments[0]) : null;
      const returnPhoto = attachments[1] ? await this.storageService.getPreSignedUrl(attachments[1]) : null;

      employeeLoans[empId].bookLoans[loan.assetHolderUuid] = {
        code: loan.asset.code,
        name: loan.asset.name,
        imageUrl: bookImageUrl,
        subCategory: loan.asset.subCategory?.name || null,
        loanHistory: {
          loaning: {
            loanPeriod: loan.assignedAt,
            loanPhoto: loanPhoto
          },
          return: {
            returnTime: loan.returnedAt,
            returnPhoto: returnPhoto,
            linkReview: loan.purpose
          }
        }
      };
    }

    return [employeeLoans];
  }
}
