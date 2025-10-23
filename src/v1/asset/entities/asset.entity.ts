import {
  Entity,
  Column,
  BeforeInsert,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../../asset-property-value/entities/asset-property-value.entity';
import { AssetMaintenance } from '../../asset-maintenance/entities/asset-maintenance.entity';
import { AssetHolder } from '../../asset-holder/entities/asset-holder.entity';
import { AssetNote } from '../../../v1/asset-note/entities/asset-note.entity';
import { Status } from '../enum/asset.enum';
import { AssetLocation } from '../../../v1/asset-location/entities/asset-location.entity';

@Entity('assets')
export class Asset extends BaseEntity {
  @Column({ name: 'asset_uuid', type: 'char', length: 36, unique: true })
  assetUuid: string;

  @Column({ name: 'sub_category_id' })
  subCategoryId: number;

  @Column({ name:'code', type: 'varchar', length: 255 })
  code: string;

  @Column({ name:'image_path', type: 'varchar', length: 255 })
  imagePath: string;
  
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name:'description', type: 'text', nullable: true})
  description: string | null;

  @Column({ name:'brand', type: 'varchar', length: 255, nullable: true })
  brand: string | null;

  @Column({ name:'model', type: 'varchar', length: 255, nullable: true })
  model: string | null;

  @Column({ name: 'price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  price: number | null;

  @Column({ name:'user', type: 'varchar', length: 255 })
  user: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date | null;

  @Column({ name:'custom_value', type: 'json', nullable: true })
  customValues?: { name: string; value: string | number }[];
  
  @Column({
    name: 'status',
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;
  
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.assetProperties)
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;
  
  @OneToMany(() => AssetPropertyValue, (value) => value.asset)
  propertyValues: AssetPropertyValue[];

  @OneToMany(() => AssetMaintenance, (history) => history.asset)
  maintenanceRecords: AssetMaintenance[];

  @OneToMany(() => AssetHolder, (holder) => holder.asset)
  holderRecords: AssetHolder[];

  @OneToMany(() => AssetLocation, (location) => location.asset)
  locationRecords: AssetLocation[];

  @OneToMany(() => AssetNote, (note) => note.asset)
  noteRecords: AssetNote[];
  
  @BeforeInsert()
    async generateUuid() {
      this.assetUuid = uuidv7();
    }
}
