import {
  Entity,
  Column,
  BeforeInsert,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Index('IDX_category_uuid')
  @Column({ name: 'category_uuid', type: 'char', length: 36, unique: true })
  categoryUuid: string;

  @Index('IDX_category_name')
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name:'has_location', type: 'boolean', default: false })
  hasLocation: boolean;

  @Column({ name:'has_maintenance', type: 'boolean', default: false })
  hasMaintenance: boolean;

  @Column({ name:'has_holder', type: 'boolean', default: false })
  hasHolder: boolean;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];

  @BeforeInsert()
  async generateUuid() {
    this.categoryUuid = uuidv7();
  }
}
