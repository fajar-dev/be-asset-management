import { Expose, Type } from 'class-transformer';

class AssetLocationBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}

class AssetLocationLocationDto {
  @Expose({ name: 'locationUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => AssetLocationBranchDto)
  branch: AssetLocationBranchDto;
}

export class ResponseAssetLocationDto {
  @Expose({ name: 'assetLocationUuid' })
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => AssetLocationLocationDto)
  location: AssetLocationLocationDto;
}