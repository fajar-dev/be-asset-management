import { Expose, Type } from 'class-transformer';

export class ResponseBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}