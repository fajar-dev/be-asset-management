import { Asset } from "../../asset/entities/asset.entity";
import { BaseEntity } from '../../../common/entities/base.entity';
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { v7 as uuidv7 } from 'uuid';

@Entity('asset_holders')
export class AssetHolder extends BaseEntity {
  @Column({ name: 'asset_holder_uuid', type: 'char', length: 36, unique: true })
  assetHolderUuid: string;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'employee_id', type: 'varchar', length: '255' })
  employeeId: string;

  @Column({ name: 'purpose', type: 'text'})
  purpose: string;

  @Column({ name: 'assigned_at', type: 'date' })
  assignedAt: Date;

  @Column({ name: 'returned_at', type: 'date' , nullable:true})
  returnedAt: Date;

  @ManyToOne(() => Asset, (asset) => asset.holderRecords)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
  
  @BeforeInsert()
    async generateUuid() {
      this.assetHolderUuid = uuidv7();
    }
}
