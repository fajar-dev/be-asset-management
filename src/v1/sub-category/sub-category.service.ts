import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  /**
   * Calculate hierarchy level based on parent ID.
   * 
   * @param parentId - Parent sub-category database ID (nullable)
   * @returns The calculated level number
   */
  private async calculateLevel(parentId: number | null): Promise<number> {
    if (!parentId) return 0;
    
    const parent = await this.subCategoryRepository.findOne({
      where: { id: parentId },
    });
    
    return parent ? parent.level + 1 : 0;
  }

  /**
   * Check if assigning a new parent creates a circular reference in hierarchy.
   * 
   * @param currentId - Current sub-category ID
   * @param newParentId - New parent sub-category ID
   * @throws {BadRequestException} - If a circular reference or self-parenting is detected
   */
  private async checkCircularReference(
    currentId: number,
    newParentId: number | null
  ): Promise<void> {
    if (!newParentId) return;
    
    if (currentId === newParentId) {
      throw new BadRequestException('A sub-category cannot be its own parent');
    }

    let parent = await this.subCategoryRepository.findOne({
      where: { id: newParentId },
      relations: ['parent'],
    });

    const visited = new Set<number>([currentId]);

    while (parent) {
      if (visited.has(parent.id)) {
        throw new BadRequestException('Circular reference detected in hierarchy');
      }
      
      visited.add(parent.id);
      
      if (parent.parentId) {
        parent = await this.subCategoryRepository.findOne({
          where: { id: parent.parentId },
          relations: ['parent'],
        });
      } else {
        break;
      }
    }
  }

  /**
   * Recursively update the `level` of all descendant sub-categories.
   * 
   * @param parentId - Parent sub-category database ID
   */
  private async updateDescendantsLevels(parentId: number): Promise<void> {
    const children = await this.subCategoryRepository.find({
      where: { parentId },
    });

    for (const child of children) {
      child.level = await this.calculateLevel(child.parentId);
      await this.subCategoryRepository.save(child);
      await this.updateDescendantsLevels(child.id);
    }
  }

  /**
   * Create a new sub-category.
   * 
   * @param userId - ID of the user creating the sub-category
   * @param createSubCategoryDto - DTO containing creation data
   * @returns The created SubCategory entity
   * @throws {BadRequestException} - If parent does not belong to same category
   */
  async create(
    userId: number,
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid: createSubCategoryDto.categoryId }
    });

    let parentId: number | null = null;
    let level = 0;

    if (createSubCategoryDto.parentId) {
      const parent = await this.subCategoryRepository.findOneOrFail({
        where: { 
          subCategoryUuid: createSubCategoryDto.parentId,
          categoryId: category.id
        },
      });
      
      parentId = parent.id;
      level = await this.calculateLevel(parentId);
    }

    const subCategory = this.subCategoryRepository.create({
      name: createSubCategoryDto.name,
      categoryId: category.id,
      parentId,
      level,
      createdBy: userId,
    });

    return this.subCategoryRepository.save(subCategory);
  }

  /**
   * Paginate sub-categories with optional search and category filter.
   * 
   * @param options - Pagination options with optional `search` and `categoryUuid`
   * @returns Paginated result of SubCategory
   */
  async paginate(
    options: IPaginationOptions & { search?: string; categoryUuid?: string },
  ): Promise<Pagination<SubCategory>> {
    const queryBuilder = this.subCategoryRepository
      .createQueryBuilder('subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('subCategory.parent', 'parent')
      .select([
        'subCategory',
        'category.id',
        'category.categoryUuid',
        'category.name',
        'parent.id',
        'parent.subCategoryUuid',
        'parent.name',
        'parent.level',
      ])
      .orderBy('subCategory.level', 'ASC')
      .addOrderBy('subCategory.name', 'ASC')
      .distinct(true);

    if (options.search) {
      queryBuilder.andWhere('subCategory.name LIKE :search', {
        search: `%${options.search}%`,
      });
    }

    if (options.categoryUuid) {
      queryBuilder.andWhere('category.categoryUuid = :categoryUuid', {
        categoryUuid: options.categoryUuid,
      });
    }

    const pagination = await paginate<SubCategory>(queryBuilder, {
      limit: options.limit ?? 10,
      page: options.page ?? 1,
    });

    for (const sub of pagination.items) {
      sub.assetProperties = await this.subCategoryRepository
        .createQueryBuilder()
        .relation(SubCategory, 'assetProperties')
        .of(sub)
        .loadMany();
    }

    return pagination;
  }

  /**
   * Get hierarchical tree of sub-categories for a specific category.
   * 
   * @param categoryUuid - UUID of the category
   * @returns Root sub-categories with nested children
   */
  async getHierarchyTree(categoryUuid: string): Promise<SubCategory[]> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid }
    });

    const roots = await this.subCategoryRepository.find({
      where: {
        categoryId: category.id,
        parentId: IsNull(),
      },
      relations: ['assetProperties'],
      order: { name: 'ASC' },
    });

    for (const root of roots) {
      await this.loadChildren(root);
    }

    return roots;
  }

  /**
   * Recursively load child sub-categories.
   * 
   * @param subCategory - Parent sub-category entity
   */
  private async loadChildren(subCategory: SubCategory): Promise<void> {
    subCategory.children = await this.subCategoryRepository.find({
      where: { parentId: subCategory.id },
      relations: ['assetProperties'],
      order: { name: 'ASC' },
    });

    for (const child of subCategory.children) {
      await this.loadChildren(child);
    }
  }

  /**
   * Get all sub-categories (flat list) under a given category UUID.
   * 
   * @param categoryUuid - UUID of the category
   * @returns List of sub-categories belonging to the category
   */
  async findAllByCategory(categoryUuid: string): Promise<SubCategory[]> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid }
    });

    return this.subCategoryRepository.find({
      where: { categoryId: category.id },
      relations: ['parent', 'assetProperties'],
      order: {
        level: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Find a single sub-category by UUID.
   * 
   * @param uuid - Sub-category UUID
   * @returns SubCategory with relations (category, parent, children, assetProperties)
   */
  async findOne(uuid: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
      relations: ['category', 'parent', 'assetProperties'],
    });

    subCategory.children = await this.subCategoryRepository.find({
      where: { parentId: subCategory.id },
      relations: ['assetProperties'],
      order: { name: 'ASC' },
    });

    return subCategory;
  }

  /**
   * Update a sub-category.
   * 
   * @param uuid - UUID of the sub-category to update
   * @param userId - ID of the user performing the update
   * @param updateSubCategoryDto - DTO containing updated data
   * @returns Updated SubCategory
   * @throws {BadRequestException} - If circular reference or invalid parent found
   */
  async update(
    uuid: string,
    userId: number,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
    });

    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid: updateSubCategoryDto.categoryId },
    });

    let newParentId: number | null = null;

    if (updateSubCategoryDto.parentId) {
      const parent = await this.subCategoryRepository.findOneOrFail({
        where: { 
          subCategoryUuid: updateSubCategoryDto.parentId,
          categoryId: category.id
        },
      });
      
      newParentId = parent.id;
      await this.checkCircularReference(subCategory.id, newParentId);
    }

    subCategory.name = updateSubCategoryDto.name;
    subCategory.categoryId = category.id;
    subCategory.parentId = newParentId;
    subCategory.level = await this.calculateLevel(newParentId);
    subCategory.updatedBy = userId;

    const updated = await this.subCategoryRepository.save(subCategory);
    await this.updateDescendantsLevels(updated.id);

    return updated;
  }

  /**
   * Soft delete a sub-category.
   * 
   * @param uuid - UUID of the sub-category to delete
   * @param userId - ID of the user performing the deletion
   * @throws {BadRequestException} - If the sub-category has children, assets, or asset properties
   */
  async remove(uuid: string, userId: number): Promise<void> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
      relations: ['children', 'assetProperties', 'assets'],
    });

    if (subCategory.children?.length > 0) {
      throw new BadRequestException(
        'Cannot delete sub-category that has child sub-categories. Please delete or reassign them first.',
      );
    }

    if (subCategory.assetProperties?.length > 0) {
      throw new BadRequestException(
        'Cannot delete sub-category because it is currently in use by asset properties.',
      );
    }

    if (subCategory.assets?.length > 0) {
      throw new BadRequestException(
        'Cannot delete sub-category because it is currently in use by assets.',
      );
    }

    subCategory.deletedBy = userId;
    await this.subCategoryRepository.save(subCategory);
    await this.subCategoryRepository.softRemove(subCategory);
  }

  /**
   * Get full path from root to a specific sub-category.
   * 
   * @param uuid - Sub-category UUID
   * @returns Ordered array of sub-categories from root to target
   */
  async getPath(uuid: string): Promise<SubCategory[]> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
    });

    const path: SubCategory[] = [subCategory];
    let current = subCategory;

    while (current.parentId) {
      current = await this.subCategoryRepository.findOneOrFail({
        where: { id: current.parentId },
      });
      path.unshift(current);
    }

    return path;
  }
}
