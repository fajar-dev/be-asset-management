import { Asset } from "../../asset/entities/asset.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v7 as uuidv7 } from 'uuid';

@Entity('asset_labels')
export class AssetLabel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'asset_label_uuid', type: 'char', length: 36, unique: true })
    assetLabelUuid: string;

    @Column({ name: 'asset_id', type: 'int' })
    assetId: number;

    @Column({ name: 'key', type: 'varchar', length: 255})
    key: string;

    @Column({ name: 'value', type: 'varchar', length: 255})
    value: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Asset, (asset) => asset.labelRecords)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @BeforeInsert()
    async generateUuid() {
        this.assetLabelUuid = uuidv7();
    }
}
