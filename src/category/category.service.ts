import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepo.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async softDelete(id: number, deletedBy?: number) {
    await this.categoryRepo.update(id, { deleted_by: deletedBy });
    const result = await this.categoryRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return { message: `Category #${id} soft deleted` };
  }

  async restore(id: number) {
    const result = await this.categoryRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return { message: `Category #${id} restored` };
  }

  async findWithDeleted() {
    return this.categoryRepo.find({ withDeleted: true });
  }
}
