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
   * Calculate level based on parent
   */
  private async calculateLevel(parentId: number | null): Promise<number> {
    if (!parentId) return 0;
    
    const parent = await this.subCategoryRepository.findOne({
      where: { id: parentId },
    });
    
    return parent ? parent.level + 1 : 0;
  }

  /**
   * Check for circular reference
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
   * Update levels of all descendants
   */
  private async updateDescendantsLevels(parentId: number): Promise<void> {
    const children = await this.subCategoryRepository.find({
      where: { parentId },
    });

    for (const child of children) {
      child.level = await this.calculateLevel(child.parentId);
      await this.subCategoryRepository.save(child);
      
      // Recursively update descendants
      await this.updateDescendantsLevels(child.id);
    }
  }

  /**
   * Create a new sub category
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
          categoryId: category.id // Ensure parent is in same category
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
   * Paginate sub categories with optional search
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
   * Get hierarchy tree for a category
   */
  async getHierarchyTree(categoryUuid: string): Promise<SubCategory[]> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid }
    });

    // Get all root subcategories (no parent)
    const roots = await this.subCategoryRepository.find({
      where: {
        categoryId: category.id,
        parentId: IsNull(),
      },
      relations: ['assetProperties'],
      order: { name: 'ASC' },
    });

    // Recursively load children
    for (const root of roots) {
      await this.loadChildren(root);
    }

    return roots;
  }

  /**
   * Recursively load children for hierarchy
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
   * Find all sub categories by category UUID (flat list)
   */
  async findAllByCategory(categoryUuid: string): Promise<SubCategory[]> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid }
    });

    return this.subCategoryRepository.find({
      where: {
        categoryId: category.id,
      },
      relations: ['parent', 'assetProperties'],
      order: {
        level: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Find a sub category by UUID with full relations
   */
  async findOne(uuid: string): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: {
        subCategoryUuid: uuid,
      },
      relations: ['category', 'parent', 'assetProperties'],
    });

    // Load children
    subCategory.children = await this.subCategoryRepository.find({
      where: { parentId: subCategory.id },
      relations: ['assetProperties'],
      order: { name: 'ASC' },
    });

    return subCategory;
  }

  /**
   * Update a sub category by UUID
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
          categoryId: category.id // Ensure parent is in same category
        },
      });
      
      newParentId = parent.id;
      
      // Check for circular reference
      await this.checkCircularReference(subCategory.id, newParentId);
    }

    // Update basic fields
    subCategory.name = updateSubCategoryDto.name;
    subCategory.categoryId = category.id;
    subCategory.parentId = newParentId;
    subCategory.level = await this.calculateLevel(newParentId);
    subCategory.updatedBy = userId;

    const updated = await this.subCategoryRepository.save(subCategory);

    // Update all descendants' levels
    await this.updateDescendantsLevels(updated.id);

    return updated;
  }

  /**
   * Soft delete a sub category and all its descendants
   */
  async remove(uuid: string, userId: number): Promise<void> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
      relations: ['children'],
    });

    // Check if has children
    if (subCategory.children && subCategory.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete sub-category with children. Please delete children first or reassign them.'
      );
    }

    subCategory.deletedBy = userId;
    await this.subCategoryRepository.save(subCategory);
    await this.subCategoryRepository.softRemove(subCategory);
  }

  /**
   * Get path from root to specific subcategory
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