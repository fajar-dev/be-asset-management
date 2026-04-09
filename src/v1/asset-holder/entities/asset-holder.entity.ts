import { Asset } from "../../asset/entities/asset.entity";
import { BaseEntity } from '../../../common/entities/base.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { Employee } from "../../../v1/employee/entities/employee.entity";

@Entity('asset_holders')
export class AssetHolder extends BaseEntity {
  @Column({ name: 'asset_holder_uuid', type: 'char', length: 36, unique: true })
  assetHolderUuid: string;

  @Column({ name: 'asset_id', type: 'int' })
  assetId: number;

  @Column({ name: 'employee_id', type: 'char', length: 36})
  employeeId: string;

  @Column({ name: 'purpose', type: 'text' })
  purpose: string;

  @Column({ name: 'assigned_at', type: 'datetime' })
  assignedAt: Date;

  @Column({ name: 'returned_at', type: 'datetime', nullable: true })
  returnedAt: Date;

  @Column({ name:'attachment_paths', type: 'json', nullable: true})
  attachmentPaths: string[];

  @Column({ name: 'is_request', type: 'boolean', default: false })
  isRequest: boolean;

  @ManyToOne(() => Asset, (asset) => asset.holderRecords)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Employee, (employee) => employee.assetHolders)
  @JoinColumn({ name: 'employee_id',  referencedColumnName: "idEmployee" })
  employee: Employee;

  @BeforeInsert()
  async generateUuid() {
    this.assetHolderUuid = uuidv7();
  }
}
