import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository, Like, IsNull } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { Category } from '../category/entities/category.entity';
import { v4 as uuidv7 } from 'uuid'
import { AssetHolder } from '../asset-holder/entities/asset-holder.entity';
import { AssetLocation } from '../asset-location/entities/asset-location.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class AssetUtilsService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(SubCategory)
        private readonly subCategoryRepository: Repository<SubCategory>,
        @InjectRepository(AssetHolder)
        private readonly assetHolderRepository: Repository<AssetHolder>,
        @InjectRepository(AssetLocation)
        private readonly assetLocationRepository: Repository<AssetLocation>,
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>
    ) {}
    /**
     * Retrieves all assets that match the given filters for Excel export.
     *
     * @param filters - Optional filter object to narrow down the query.
     * @param filters.subCategoryId - Subcategory UUID (optional)
     * @param filters.categoryId - Category UUID (optional)
     * @param filters.status - Asset status (optional, e.g., 'active', 'maintenance', etc.)
     * @param filters.employeeId - Employee UUID who currently holds the asset (optional)
     * @param filters.locationId - Location UUID where the asset is currently placed (optional)
     * @param filters.startDate - Start date filter for purchase date (optional, format: 'YYYY-MM-DD')
     * @param filters.endDate - End date filter for purchase date (optional, format: 'YYYY-MM-DD')
     *
     * @returns Promise<Asset[]> - Returns an array of fully loaded `Asset` entities including relations
     * such as subCategory, category, propertyValues, holderRecords, and locationRecords.
     */
    async getAssetsForExport(filters: {
        subCategoryId?: string;
        categoryId?: string;
        status?: string;
        employeeId?: string;
        locationId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Asset[]> {
        const {
        subCategoryId,
        categoryId,
        status,
        employeeId,
        locationId,
        startDate,
        endDate,
        } = filters;

        const qb = this.assetRepository.createQueryBuilder('asset')
        .leftJoinAndSelect('asset.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('asset.propertyValues', 'propertyValues')
        .leftJoinAndSelect('propertyValues.property', 'property')
        .leftJoinAndSelect('asset.holderRecords', 'holderRecords')
        .leftJoinAndSelect('holderRecords.employee', 'employee')
        .leftJoinAndSelect('asset.locationRecords', 'locationRecords')
        .leftJoinAndSelect('locationRecords.location', 'location')
        .leftJoinAndSelect('location.branch', 'branch')
        .where('asset.deletedAt IS NULL');

        if (categoryId) {
        qb.andWhere('category.categoryUuid = :categoryId', { categoryId });
        }

        if (subCategoryId) {
        qb.andWhere('subCategory.subCategoryUuid = :subCategoryId', { subCategoryId });
        }

        if (status) {
        qb.andWhere('asset.status = :status', { status });
        }

        if (employeeId) {
        qb.andWhere(qb2 => {
            const subQuery = qb2.subQuery()
            .select('ah.asset_id')
            .from('asset_holders', 'ah')
            .where('ah.employee_id = :employeeId')
            .andWhere('ah.returned_at IS NULL')
            .andWhere('ah.deleted_at IS NULL')
            .getQuery();
            return 'asset.id IN ' + subQuery;
        }).setParameter('employeeId', employeeId);
        }

        if (locationId) {
        qb.andWhere(qb2 => {
            const subQuery = qb2.subQuery()
            .select('al.asset_id')
            .from('asset_locations', 'al')
            .leftJoin('locations', 'l', 'al.location_id = l.id')
            .where('al.deletedAt IS NULL')
            .andWhere('l.location_uuid = :locationUuid')
            .andWhere(qb3 => {
                const lastLocSub = qb3.subQuery()
                .select('MAX(al2.createdAt)')
                .from('asset_locations', 'al2')
                .where('al2.asset_id = al.asset_id')
                .andWhere('al2.deletedAt IS NULL')
                .getQuery();
                return 'al.createdAt = ' + lastLocSub;
            })
            .getQuery();

            return 'asset.id IN ' + subQuery;
        }).setParameter('locationUuid', locationId);
        }

        if (startDate && endDate) {
        qb.andWhere('asset.purchaseDate BETWEEN :startDate AND :endDate', { startDate, endDate });
        } else if (startDate) {
        qb.andWhere('asset.purchaseDate >= :startDate', { startDate });
        } else if (endDate) {
        qb.andWhere('asset.purchaseDate <= :endDate', { endDate });
        }

        qb.orderBy('asset.purchaseDate', 'DESC');

        return qb.getMany();
    }

/**
 * Imports a single asset record from Excel into the database.
 *
 * @param code - The unique asset code.
 * @param name - The asset name.
 * @param description - Optional asset description.
 * @param categoryName - Name of the asset's category.
 * @param subCategoryName - Name of the asset's sub-category.
 * @param brand - The asset's brand.
 * @param model - The asset's model.
 * @param purchaseDate - Purchase date in string format.
 * @param price - Asset price (may contain currency symbols).
 * @param userName - Name of the user linked to the asset.
 * @param holderEmployeeId - Employee ID of the asset holder.
 * @param locationName - The name of the asset's location.
 * @param branchId - The branch ID the asset belongs to.
 * @param status - The asset's current status (default: 'active').
 * @param userId - The user ID performing the import.
 * @param failedList - Reference to an array that collects failed imports.
 *
 * @returns Promise<{ success: boolean }> - Whether the asset import succeeded.
 */
    async importAssets(
    code: string,
    name: string,
    description?: string,
    categoryName?: string,
    subCategoryName?: string,
    brand?: string,
    model?: string,
    purchaseDate?: string,
    price?: string,
    userName?: string,
    holderEmployeeId?: string,
    locationName?: string,
    branchId?: string,
    userId?: number,
    failedList: any[] = [],
    ): Promise<{ success: boolean }> {
    try {
        // === VALIDATION ===
        if (!code || !name) {
        failedList.push({
            code,
            name,
            error: 'Asset code and name are required.',
        });
        return { success: false };
        }

        const existingAsset = await this.assetRepository.findOne({
        where: { code, deletedAt: IsNull() },
        });

        if (existingAsset) {
        failedList.push({
            code,
            name,
            error: `Asset code "${code}" is already in use by an active asset.`,
        });
        return { success: false };
        }

        let category: Category | null = null;
        let subCategory: SubCategory | null = null;

        if (categoryName?.trim()) {
        const catName = categoryName.trim();

        category = await this.categoryRepository.findOne({
            where: { name: Like(catName) },
        });

        if (!category) {
            category = this.categoryRepository.create({
            name: catName,
            hasHolder: true,
            hasLocation: true,
            hasMaintenance: true,
            createdBy: userId,
            });
            category = await this.categoryRepository.save(category);

            if (subCategoryName?.trim()) {
            const subCatName = subCategoryName.trim();
            subCategory = this.subCategoryRepository.create({
                name: subCatName,
                categoryId: category.id,
                createdBy: userId,
            });
            subCategory = await this.subCategoryRepository.save(subCategory);
            }
        } else {
            if (subCategoryName?.trim()) {
            const subCatName = subCategoryName.trim();
            subCategory = await this.subCategoryRepository.findOne({
                where: {
                name: Like(subCatName),
                categoryId: category.id,
                },
            });

            if (!subCategory) {
                subCategory = this.subCategoryRepository.create({
                name: subCatName,
                categoryId: category.id,
                createdBy: userId,
                });
                subCategory = await this.subCategoryRepository.save(subCategory);
            }
            }
        }
        }

        // === LOCATION ===
        let location: Location | null = null;
        if (locationName?.trim() && branchId) {
        const locName = locationName.trim();

        location = await this.locationRepository.findOne({
            where: { name: Like(locName), branchId },
        });

        if (!location) {
            location = this.locationRepository.create({
            name: locName,
            branchId,
            createdBy: userId,
            });
            location = await this.locationRepository.save(location);
        }
        }

        const normalizedPrice = price
        ? Number(price.toString().replace(/[^0-9]/g, ''))
        : 0;

        const asset = this.assetRepository.create({
            imagePath: '/image/no-image.jpg',
            code,
            name,
            description: description?.trim() || null,
            brand: brand?.trim() || null,
            model: model?.trim() || null,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            price: normalizedPrice,
            user: userName?.trim(),
            subCategoryId: subCategory?.id,
            createdBy: userId,
        });

        const savedAsset = await this.assetRepository.save(asset);

        if (holderEmployeeId) {
            const holder = this.assetHolderRepository.create({
                    assetId: savedAsset.id,
                    employeeId: holderEmployeeId,
                    assignedAt: new Date(),
                    purpose: 'Imported from Excel',
                    createdBy: userId,
                });
                console.log(holder)
            await this.assetHolderRepository.save(holder);
        }

        if (location && branchId) {
            await this.assetLocationRepository.insert({
                assetLocationUuid: uuidv7(),
                assetId: savedAsset.id,
                locationId: location.id,
                createdBy: userId,
            });
        }

        return { success: true };
    } catch (error) {
        const message =
        error?.code === 'ER_DUP_ENTRY'
            ? `Asset code "${code}" is duplicated.`
            : error?.sqlMessage || error?.message || 'Unknown error occurred.';

        failedList.push({
        code,
        name,
        error: message,
        });

        return { success: false };
    }
    }

}