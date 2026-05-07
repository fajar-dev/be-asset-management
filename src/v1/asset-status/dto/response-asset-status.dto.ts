import { Expose, Type } from 'class-transformer';
import { AssetStatusType } from '../enum/asset-status.enum';
import { ResponseUserDto } from '../../user/dto/response-user.dto';

export class ResponseAssetStatusDto {
  @Expose({ name: 'assetStatusUuid' })
  id: string;

  @Expose()
  type: AssetStatusType;

  @Expose()
  note: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ResponseUserSimpleDto)
  user: ResponseUserSimpleDto | null;
}

export class ResponseUserSimpleDto {
  @Expose()
  name: string;

  @Expose()
  employeeId: string;

  @Expose()
  avatar: string;
}