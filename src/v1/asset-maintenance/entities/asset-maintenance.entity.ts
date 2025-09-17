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
import { Asset } from '../../asset/entities/asset.entity';

@Entity('asset_maintenances')
export class AssetMaintenance extends BaseEntity {
  @Column({ name: 'asset_maintenance_uuid', type: 'char', length: 36, unique: true })
  assetMaintenanceUuid: string;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'maintenance_at', type: 'date' })
  maintenanceAt: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Asset, (asset) => asset.maintenanceRecords)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
  
  @BeforeInsert()
  async generateUuid() {
    this.assetMaintenanceUuid = uuidv7();
  }
}
