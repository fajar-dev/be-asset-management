import {
  Entity,
  Column,
  BeforeInsert,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { Category } from '../../category/entities/category.entity';

@Entity('sub_categories')
export class SubCategory extends BaseEntity {
  @Index('IDX_sub_category_uuid')
  @Column({ name: 'sub_category_uuid', type: 'char', length: 36, unique: true })
  subCategoryUuid: string;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Index('IDX_sub_category_name')
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Category, (category) => category.subCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @BeforeInsert()
  async generateUuid() {
    this.subCategoryUuid = uuidv7();
  }
}
