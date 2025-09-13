import { Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { Repository } from 'typeorm';
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
    * Create a new sub category
    * @param createCategorydto - DTO containing data to create a sub category
    * @returns Promise<SubCategory> - the created sub category entity
  */
  async create(
    userId: number,
    subCreateCategorydto: CreateSubCategoryDto,
  ): Promise<SubCategory> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid: subCreateCategorydto.categoryId }
    });
    const subCategory = this.subCategoryRepository.create({
      name: subCreateCategorydto.name,
      categoryId: category.id,
      createdBy: userId,
    });
    return this.subCategoryRepository.save(subCategory);
  }

  /**
    * Paginate sub categories with optional search
    * @param options - Pagination options plus optional search string
    * @returns Promise<Pagination<SubCategory>> - paginated result of sub categories
 */
  async paginate(
  options: IPaginationOptions & { search?: string;},
  ): Promise<Pagination<SubCategory>> {
    const queryBuilder = this.subCategoryRepository.createQueryBuilder('sub_categories');

    queryBuilder
      .leftJoinAndSelect('sub_categories.category', 'categories')
      .leftJoinAndSelect('sub_categories.assetProperties', 'asset_properties'); 

    if (options.search) {
      queryBuilder.andWhere('sub_categories.name LIKE :search', {
        search: `%${options.search}%`,
      });
    }

    return paginate<SubCategory>(queryBuilder, {
      limit: options.limit || 10,
      page: options.page || 1,
    });
  }


  /**
   * Find all sub categories by category UUID
   * @param categoryUuid - UUID of the category
   * @returns Promise<SubCategory[]> - the found sub categories
   */
  async findAllByCategory(categoryUuid: string): Promise<SubCategory[]> {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid }
    });

    return this.subCategoryRepository.find({
      where: {
        categoryId: category.id,
      },
      relations: ['assetProperties'],
    });
  }

  /**
   * Find a sub category by UUID
   * @param id - UUID of the sub category
   * @returns Promise<Category> - the found sub category entity
   * @throws NotFoundException if sub category is not found
   */
  findOne(id: string): Promise<SubCategory> {
    return this.subCategoryRepository.findOneOrFail({
      where: {
        subCategoryUuid: id,
      },
      relations: ['category', 'assetProperties'],
    });
  }

  /**
 * Update a sub category by UUID
 * @param uuid - UUID of the sub category to update
 * @param userId - ID of the user performing the update
 * @param updateSubCategoryDto - DTO containing updated sub category data
 * @returns Promise<SubCategory> - the updated sub category entity
 * @throws NotFoundException if sub category is not found
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
    subCategory.name = updateSubCategoryDto.name;
    subCategory.categoryId = category.id;
    subCategory.updatedBy = userId;
    return this.subCategoryRepository.save(subCategory);
  }

  /**
   * Soft delete a sub category by UUID
   * @param uuid - UUID of the sub category to delete
   * @returns Promise<import("typeorm").UpdateResult> - result of soft delete operation
   */
  async remove(uuid: string, userId: number) {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: uuid },
    });
    subCategory.deletedBy = userId;
    await this.subCategoryRepository.save(subCategory);
    return await this.subCategoryRepository.softRemove(subCategory);
  }
}
