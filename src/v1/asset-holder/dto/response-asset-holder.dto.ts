import { Expose, Type } from 'class-transformer';

class AssetHolderEmployeeBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}

class AssetHolderEmployeeDto {
  @Expose({ name: 'idEmployee' })
  employeeId: string;

  @Expose()
  fullName: string;

  @Expose()
  jobPosition: string;

  @Expose()
  email: string;

  @Expose()
  mobilePhone: string;

  @Expose()
  photoProfile: string;

  @Expose()
  hasHolder: boolean;

  @Expose()
  @Type(() => AssetHolderEmployeeBranchDto)
  branch: AssetHolderEmployeeBranchDto;
}

export class ResponseAssetHolderDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  purpose: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt: Date | null;

  @Expose()
  attachmentPaths: string[];

  @Expose()
  attachmentUrls: string[];

  @Expose()
  isRequest: boolean;

  @Expose()
  @Type(() => AssetHolderEmployeeDto)
  employee: AssetHolderEmployeeDto;
}
