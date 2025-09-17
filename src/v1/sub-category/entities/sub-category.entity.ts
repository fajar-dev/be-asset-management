import {
  Entity,
  Column,
  BeforeInsert,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { Category } from '../../category/entities/category.entity';
import { AssetProperty } from '../../asset-property/entities/asset-property.entity';

@Entity('sub_categories')
export class SubCategory extends BaseEntity {
  @Column({ name: 'sub_category_uuid', type: 'char', length: 36, unique: true })
  subCategoryUuid: string;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Category, (category) => category.subCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => AssetProperty, (assetProperty) => assetProperty.subCategory)
  assetProperties: AssetProperty[];

  @BeforeInsert()
  async generateUuid() {
    this.subCategoryUuid = uuidv7();
  }
}
