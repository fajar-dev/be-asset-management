import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from '../../v1/asset/entities/asset.entity';
import { IsNull, Repository } from 'typeorm';
import { AssetHolder } from '../../v1/asset-holder/entities/asset-holder.entity';
import { User } from '../../v1/user/entities/user.entity';
import { ReturnBookDto } from './dto/return-book.dto';
import { StorageService } from '../../storage/storage.service';
import { Employee } from '../../v1/employee/entities/employee.entity';
import { LogAsset } from '../../v1/asset-log/decorator/log-asset.decorator';
import { AssetLogType } from '../../v1/asset-log/enum/asset-log.enum';
import { AssetStatusType } from '../../v1/asset-status/enum/asset-status.enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetHolder)
    private readonly assetHolderRepository: Repository<AssetHolder>,
    @InjectRepository(Employee)
    public readonly employeeRepository: Repository<Employee>,
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

  async findOne(code: string): Promise<Asset> {
    return await this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('asset.code = :code', { code })
      .andWhere('category.name = :categoryName', { categoryName: 'Buku' })
      .andWhere((qb) => {
        const sub = qb.subQuery()
          .select('ah.assetId')
          .from(AssetHolder, 'ah')
          .where('ah.returnedAt IS NULL')
          .andWhere('ah.deletedAt IS NULL')
          .getQuery();
        return `asset.id NOT IN ${sub}`;
      })
      .getOneOrFail();
  }

  @LogAsset(async (args, result, ctx) => {
    const user = args[2];
    const employee = await ctx.employeeRepository.findOne({ where: { idEmployee: user.employeeId } });
    return `Assigned asset to ${employee?.fullName || 'Unknown'}`;
  }, AssetLogType.HOLDER)
  async assign(userId: number, assetUuid: string, user: User, body: any) {

    const asset = await this.assetRepository.findOneOrFail({
      where: { assetUuid: assetUuid },
      relations: ['statusRecords']
    });

    const lastStatus = (asset.statusRecords || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;

    if (!lastStatus || lastStatus.type !== AssetStatusType.ACTIVE) {
      throw new BadRequestException('The asset status is inactive.');
    }

    if (!asset.isLendable) {
      throw new BadRequestException('This asset is not lendable.');
    }

    const activeEmployeeHolder = await this.assetHolderRepository.findOne({
      where: {
        employeeId: user.employeeId,
        returnedAt: IsNull(),
        isRequest: true,
      },
    });

    if (activeEmployeeHolder) {
      throw new BadRequestException('You already have an active loan. Please return it first.');
    }

    const lastAssignment = await this.assetHolderRepository.findOne({
      where: { assetId: asset.id, returnedAt: IsNull() }
    });

    if (lastAssignment) {
      throw new BadRequestException('The book is currently on loan.');
    }

    const uploadedPaths: string[] = [];
    if (body.attachments) {
      for (const file of body.attachments) {
        const objectPath = await this.storageService.uploadFile('asset-holder', file);
        if (objectPath) {
          uploadedPaths.push(objectPath);
        }
      }
    }

    const assetHolder = this.assetHolderRepository.create({
      assetId: asset.id,
      employeeId: user.employeeId,
      assignedAt: new Date(),
      purpose: body.purpose || 'Book Loan Request',
      attachmentPaths: uploadedPaths,
      isRequest: true,
      createdBy: user.id
    });

    await this.assetHolderRepository.save(assetHolder);
    return { assetUuid: asset.assetUuid, success: true } as any;
  }

  @LogAsset(async (args, result, ctx) => {
    const body = args[3];
    const assetHolderUuid = body.assetHolderId;
    const assetHolder = await ctx.assetHolderRepository.findOne({ where: { assetHolderUuid }, relations: ['employee'] });
    return `Returned asset from ${assetHolder?.employee?.fullName || 'Unknown'}`;
  }, AssetLogType.HOLDER)
  async return(userId: number, assetUuid: string, user: User, body: ReturnBookDto) {

    const assetHolder = await this.assetHolderRepository.findOneOrFail({
      where: { 
        assetHolderUuid: assetUuid,
        employeeId: user.employeeId,
        returnedAt: IsNull()
      },
      relations: ['asset']
    });

    const lastAssignment = await this.assetHolderRepository.findOne({
      where: { 
        assetHolderUuid: body.assetHolderId, 
        assetId: assetHolder.assetId, 
        employeeId: user.employeeId,
        returnedAt: IsNull() 
      }
    });

    if (!lastAssignment) {
      throw new BadRequestException('Asset assignment record not found or already returned.');
    }

    const uploadedPaths: string[] = [];
    if (body.attachments) {
      for (const file of body.attachments) {
        const objectPath = await this.storageService.uploadFile('asset-holder', file);
        if (objectPath) {
          uploadedPaths.push(objectPath);
        }
      }
    }

    const currentPaths = Array.isArray(lastAssignment.attachmentPaths) ? lastAssignment.attachmentPaths : [];
    lastAssignment.attachmentPaths = [...currentPaths, ...uploadedPaths];
    lastAssignment.returnedAt = new Date();
    lastAssignment.purpose = body.purpose;
    
    await this.assetHolderRepository.save(lastAssignment);
    return { assetUuid: assetHolder.asset?.assetUuid || assetUuid, success: true } as any;
  }

  async findLoansByEmployee(employeeId: string) {
    const qb = this.assetHolderRepository.createQueryBuilder('ah')
      .leftJoinAndSelect('ah.asset', 'asset')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('ah.employeeId = :employeeId', { employeeId })
      .andWhere('category.name = :categoryName', { categoryName: 'Buku' })
      .andWhere('ah.returnedAt IS NULL')
      .andWhere('ah.isRequest = true');

    return await qb.orderBy('ah.assignedAt', 'DESC').getMany();
  }

  async findAllLoans(search?: string, startDate?: string, endDate?: string, hasReturn?: boolean | string) {
    const qb = this.assetHolderRepository.createQueryBuilder('ah')
      .leftJoinAndSelect('ah.asset', 'asset')
      .leftJoinAndSelect('ah.employee', 'employee')
      .leftJoinAndSelect('asset.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('category.name = :categoryName', { categoryName: 'Buku' });

    if (hasReturn !== undefined && hasReturn !== '') {
      const isTrue = String(hasReturn) === 'true';
      if (isTrue) {
        qb.andWhere('ah.returnedAt IS NOT NULL');
      } else {
        qb.andWhere('ah.returnedAt IS NULL');
      }
    }

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
