import {
  Entity,
  Column,
  BeforeInsert,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../../asset-property-value/entities/asset-property-value.entity';

@Entity('asset_properties')
export class AssetProperty extends BaseEntity {
  @Index('IDX_category_uuid')
  @Column({ name: 'asset_property_uuid', type: 'char', length: 36, unique: true })
  assetPropertyUuid: string;

  
  @Column({ name: 'sub_category_id' })
  subCategoryId: number;
  
  @Index('IDX_asset_property_name')
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;
  
  @Column({
    name: 'data_type',
    type: 'enum',
    enum: ['string', 'number'],
  })
  dataType: 'string' | 'number';
  
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.assetProperties)
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @OneToMany(() => AssetPropertyValue, (value) => value.property)
  values: AssetPropertyValue[];
  
  @BeforeInsert()
    async generateUuid() {
      this.assetPropertyUuid = uuidv7();
    }
}
