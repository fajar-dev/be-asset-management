import { Expose, Type } from 'class-transformer';
import { ResponseBranchDto } from '../../../v1/branch/dto/response-branch.dto';

export class ResponseLocationDto {
  @Expose({ name: 'locationUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ResponseBranchDto)
  branch: ResponseBranchDto
}