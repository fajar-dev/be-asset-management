import { AssetLocation } from "../../asset-location/entities/asset-location.entity";
import { BaseEntity } from "../../../common/entities/base.entity";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { Branch } from "../../../v1/branch/entities/branch.entity";

@Entity('locations')
export class Location extends BaseEntity {
  @Column({ name: 'location_uuid', type: 'char', length: 36, unique: true })
  locationUuid: string;
  
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: "branch_id", type: "char", length: 36 })
  branchId: string;
  

  @OneToMany(() => AssetLocation, (assetLocation) => assetLocation.location)
  assetLocations: AssetLocation[]; 
  
  @ManyToOne(() => Branch, (branch) => branch.locations)
  @JoinColumn({ name: "branch_id", referencedColumnName: "idBranch" }) 
  branch: Branch;

  @BeforeInsert()
  async generateUuid() {
    this.locationUuid = uuidv7();
  }
}