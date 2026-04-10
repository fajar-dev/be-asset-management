import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AssetStatusType } from "../enum/asset-status.enum";
import { v7 as uuidv7 } from 'uuid';
import { Asset } from "../../asset/entities/asset.entity";
import { User } from "../../user/entities/user.entity";

@Entity('asset_statuses')
export class AssetStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'asset_status_uuid', type: 'char', length: 36, unique: true })
    assetStatusUuid: string;

    @Column({ name: 'asset_id', type: 'int' })
    assetId: number;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number | null;

    @Column({ name: 'note', type: 'text', nullable: true })
    note: string;

    @Column({ name: 'type', type: 'enum', enum: AssetStatusType, default: AssetStatusType.ACTIVE })
    type: AssetStatusType;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Asset, (asset) => asset.statusRecords)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @ManyToOne(() => User, (user) => user.assetStatuses)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @BeforeInsert()
    async generateUuid() {
        this.assetStatusUuid = uuidv7();
    }
}
