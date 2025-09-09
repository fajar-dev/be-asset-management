import {
  Entity,
  Column,
  BeforeInsert,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';
import { Asset } from '../../asset/entities/asset.entity';
import { AssetProperty } from '../../asset-property/entities/asset-property.entity';

@Entity('asset_property_values')
export class AssetPropertyValue extends BaseEntity {
  @Index('IDX_category_uuid')
  @Column({ name: 'asset_property_value_uuid', type: 'char', length: 36, unique: true })
  assetPropertyValueUuid: string;
  
  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'asset_property_id' })
  propertyId: number;

  @Column({ name: 'value_string', type: 'varchar', length: 255, nullable: true })
  valueString: string | null;

  @Column({ name: 'value_int', type: 'int', nullable: true })
  valueInt: number | null;

  @ManyToOne(() => Asset, (asset) => asset.propertyValues)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => AssetProperty, (property) => property.values)
  @JoinColumn({ name: 'asset_property_id' })
  property: AssetProperty;
  
  @BeforeInsert()
    async generateUuid() {
      this.assetPropertyValueUuid = uuidv7();
    }
}
