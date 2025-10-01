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
@Index(['categoryId', 'parentId'])
@Index(['level'])
export class SubCategory extends BaseEntity {
  @Column({ name: 'sub_category_uuid', type: 'char', length: 36, unique: true })
  subCategoryUuid: string;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ name: 'level', type: 'int', default: 0 })
  level: number;

  @ManyToOne(() => Category, (category) => category.subCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: SubCategory | null;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.parent)
  children: SubCategory[];

  @OneToMany(() => AssetProperty, (assetProperty) => assetProperty.subCategory)
  assetProperties: AssetProperty[];

  @BeforeInsert()
  async generateUuid() {
    this.subCategoryUuid = uuidv7();
  }
}