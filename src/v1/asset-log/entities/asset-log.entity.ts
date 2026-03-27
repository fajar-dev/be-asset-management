import { Asset } from "../../asset/entities/asset.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { User } from "../../user/entities/user.entity";

@Entity('asset_logs')
export class AssetLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'asset_log_uuid', type: 'char', length: 36, unique: true })
    assetLogUuid: string;

    @Column({ name: 'asset_id', type: 'int' })
    assetId: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'message', type: 'text' })
    message: string;

    @Column({ name: 'type', type: 'enum', enum: ['asset', 'holder', 'maintenance', 'note', 'location'] })
    type: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Asset, (asset) => asset.logRecords)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @ManyToOne(() => User, (user) => user.assetLogs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @BeforeInsert()
    async generateUuid() {
        this.assetLogUuid = uuidv7();
    }
}
