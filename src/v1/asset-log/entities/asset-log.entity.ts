import { Asset } from "../../asset/entities/asset.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { Employee } from "../../../v1/employee/entities/employee.entity";

@Entity('asset_logs')
export class AssetLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'asset_log_uuid', type: 'char', length: 36, unique: true })
    assetLogUuid: string;

    @Column({ name: 'asset_id', type: 'int' })
    assetId: number;

    @Column({ name: 'employee_id', type: 'char', length: 36})
    employeeId: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    @Column({ name: 'type', type: 'enum', enum: ['asset', 'holder', 'maintenance', 'note', 'location'] })
    type: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Asset, (asset) => asset.logRecords)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @ManyToOne(() => Employee, (employee) => employee.assetLogs)
    @JoinColumn({ name: 'employee_id',  referencedColumnName: "idEmployee" })
    employee: Employee;

    @BeforeInsert()
    async generateUuid() {
        this.assetLogUuid = uuidv7();
    }
}
