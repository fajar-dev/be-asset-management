import { Asset } from "../../asset/entities/asset.entity";
import { Column, Entity, Index, BeforeInsert, ManyToOne, JoinColumn, } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { Location } from "../../location/entities/location.entity";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity('asset_locations')
export class AssetLocation extends BaseEntity {
  @Index('IDX_asset_location_uuid')
  @Column({ name: 'asset_location_uuid', type: 'char', length: 36, unique: true })
  assetLocationUuid: string;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ name: 'location_id' })
  locationId: number;

  @ManyToOne(() => Asset, (asset) => asset.locationRecords)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Location, (location) => location.assetLocations)
  @JoinColumn({ name: 'location_id' })
  location: Location;
  
  @BeforeInsert()
  async generateUuid() {
    this.assetLocationUuid = uuidv7();
  }
}
