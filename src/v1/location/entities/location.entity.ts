import { AssetLocation } from "../../asset-location/entities/asset-location.entity";
import { BaseEntity } from "../../../common/entities/base.entity";
import { BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm";
import { v7 as uuidv7 } from 'uuid';

@Entity('locations')
export class Location extends BaseEntity {
  @Index('IDX_location_uuid')
  @Column({ name: 'location_uuid', type: 'char', length: 36, unique: true })
  locationUuid: string;
  
  @Index('IDX_location_name')
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name:'branch', type: 'varchar', length: 255 })
  branch: string;

  @OneToMany(() => AssetLocation, (assetLocation) => assetLocation.location)
  assetLocations: AssetLocation[]; 

  @BeforeInsert()
  async generateUuid() {
    this.locationUuid = uuidv7();
  }
}
