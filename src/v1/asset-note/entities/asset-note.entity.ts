import { Asset } from "../../asset/entities/asset.entity";
import { v7 as uuidv7 } from 'uuid';
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity('asset_notes')
export class AssetNote extends BaseEntity {
  @Column({ name: 'asset_note_uuid', type: 'char', length: 36, unique: true })
  assetNoteUuid: string;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'occured_at', type: 'date' })
  occuredAt: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Asset, (asset) => asset.noteRecords)
  @JoinColumn({ name: 'asset_id' })     
  asset: Asset;
  
  @BeforeInsert()
  async generateUuid() {
    this.assetNoteUuid = uuidv7();
  }
}

