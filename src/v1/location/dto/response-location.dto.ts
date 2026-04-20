import { Expose, Type } from 'class-transformer';

class LocationBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}

export class ResponseLocationDto {
  @Expose({ name: 'locationUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => LocationBranchDto)
  branch: LocationBranchDto;
}