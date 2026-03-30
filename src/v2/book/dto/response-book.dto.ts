import { Expose, Transform, Type } from 'class-transformer';
import { ResponseEmployeeDto } from '../../../v1/employee/dto/response-employee.dto';
import { Status } from '../../../v1/asset/enum/asset.enum';

import { ResponseLocationDto } from '../../../v1/location/dto/response-location.dto';

export class ResponseSubCategoryDto {
  @Expose({ name: 'subCategoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  parent: ResponseSubCategoryDto | null;
}

export class ResponseAssetHolderDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt?: Date | null;

  @Expose()
  @Type(() => ResponseEmployeeDto)
  employee: ResponseEmployeeDto;
}

export class ResponseBookDto {
  @Expose({ name: 'assetUuid' })
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  imageUrl: string | null;

  @Expose()
  imagePath: string | null;

  @Expose()
  @Transform(({ value }) => value ?? null)
  description: string | null;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  user: string;

  @Expose()
  price: string | null;

  @Expose()
  purchaseDate: Date | null;

  @Expose()
  status: Status;

  @Expose()
  isLendable: boolean;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  subCategory: ResponseSubCategoryDto;

  @Expose()
  @Type(() => ResponseAssetHolderDto)
  activeHolder?: ResponseAssetHolderDto | null;

  @Expose()
  @Type(() => ResponseLocationDto)
  lastLocation?: ResponseLocationDto | null;
}

