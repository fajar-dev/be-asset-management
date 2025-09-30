import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Create a new category
   * @param createCategorydto - DTO containing data to create a category
   * @returns Promise<Category> - the created category entity
   */
  async create(userId: number, createCategorydto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      name: createCategorydto.name,
      hasMaintenance: createCategorydto.hasMaintenance,
      hasHolder: createCategorydto.hasHolder,
      createdBy: userId,
    });
    return this.categoryRepository.save(category);
  }

  /**
   * Find a category by UUID
   * @param id - UUID of the category
   * @returns Promise<Category> - the found category entity
   * @throws NotFoundException if category is not found
   */
  findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOneOrFail({
      where: {
        categoryUuid: id,
      },
    });
  }
  

  /**
   * Get all categories or search by name
   * @param search - Optional name search string
   * @returns Promise<Category[]> - Array of category entities matching the search criteria, if provided
   */
  async findAll(search?: string): Promise<Category[]> {
    if (search) {
      return this.categoryRepository.find({
        where: {
          name: Like(`%${search}%`)
        },
      });
    } else {
      return this.categoryRepository.find();
    }
  }

  /**
   * Paginate categories with optional search
   * @param options - Pagination options plus optional search string
   * @returns Promise<Pagination<Category>> - paginated result of categories
   */
  async paginate(
    options: IPaginationOptions & { search?: string },
  ): Promise<Pagination<Category>> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('categories');
    if (options.search) {
      queryBuilder.andWhere('categories.name LIKE :search', {
        search: `%${options.search}%`,
      });
    }
    return paginate<Category>(queryBuilder, {
      limit: options.limit || 10,
      page: options.page || 1,
    });
  }

  /**
   * Update a category by UUID
   * @param uuid - UUID of the category to update
   * @param updateCategoryDto - DTO containing updated category data
   * @returns Promise<Category> - the updated category entity
   * @throws NotFoundException if category is not found
   */
  async update(
    uuid: string,
    userId: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOneOrFail({
      where: {
        categoryUuid: uuid,
      },
    });

    category.name = updateCategoryDto.name;
    category.hasMaintenance = updateCategoryDto.hasMaintenance;
    category.hasHolder = updateCategoryDto.hasHolder;
    category.updatedBy = userId;

    return this.categoryRepository.save(category);
  }

  /**
   * Soft delete a category by UUID
   * @param uuid - UUID of the category to delete
   * @returns Promise<import("typeorm").UpdateResult> - result of soft delete operation
   */
  async remove(uuid: string, userId: number) {
    const category = await this.categoryRepository.findOneOrFail({
      where: { categoryUuid: uuid },
    });
    category.deletedBy = userId;
    await this.categoryRepository.save(category);
    return await this.categoryRepository.softRemove(category);
  }
}
