import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { Category } from '../../category/entities/category.entity';
import { AssetProperty } from '../../asset-property/entities/asset-property.entity';
import { Asset } from '../../../v1/asset/entities/asset.entity';

/**
 * SubCategory Entity
 * Menyimpan data subkategori yang bisa bersarang (parent-child)
 * dan terhubung dengan Category utama.
 */
@Entity('sub_categories')
@Index(['level'])
export class SubCategory extends BaseEntity {
  @Column({ name: 'sub_category_uuid', type: 'char', length: 36, unique: true })
  subCategoryUuid: string;

  // Foreign key ke tabel categories
  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  // Self-referencing parent
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ name: 'level', type: 'int', default: 0 })
  level: number;

  /** 
   * Relasi ke Category utama
   */
  @ManyToOne(() => Category, (category) => category.subCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  /**
   * Relasi ke SubCategory parent (self join)
   */
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: SubCategory | null;

  /**
   * Relasi ke SubCategory anak-anaknya (self join)
   */
  @OneToMany(() => SubCategory, (subCategory) => subCategory.parent)
  children: SubCategory[];

  /**
   * Relasi ke asset properties yang terkait
   */
  @OneToMany(() => AssetProperty, (assetProperty) => assetProperty.subCategory)
  assetProperties: AssetProperty[];

   /** Relation to Assets */
  @OneToMany(() => Asset, (asset) => asset.subCategory)
  assets: Asset[];

  @BeforeInsert()
  async generateUuid() {
    this.subCategoryUuid = uuidv7();
  }
}
