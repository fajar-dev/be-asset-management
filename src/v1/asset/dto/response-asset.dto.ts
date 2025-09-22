import { Expose, Transform, Type } from 'class-transformer';
import { ResponseSubCategoryDto } from '../../sub-category/dto/response-sub-category.dto';
import { ResponseEmployeeDto } from '../../../v1/employee/dto/response-employee.dto';
import { ResponseBranchDto } from 'src/v1/branch/dto/response-branch.dto';

export class ResponsePropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: string;
}

export class ResponseAssetPropertyValueDto {
  @Expose({ name: 'assetPropertyValueUuid' })
  id: string;

  @Expose()
  @Transform(({ obj }) => {
    switch (obj.property?.dataType) {
      case 'number':
        return obj.valueInt ?? null;
      case 'string':
        return obj.valueString ?? null;
      default:
        return null;
    }
  })
  value: string | number | null;

  @Expose()
  @Type(() => ResponsePropertyDto)
  property: ResponsePropertyDto;
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

export class ResponseAssetLastLocationDto {
  @Expose({ name: 'assetLocationUuid' })
  id: string;

  @Expose({ name: 'locationUuid' })
  locationId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ResponseBranchDto)
  branch: ResponseBranchDto;
}

export class ResponseAssetDto {
  @Expose({ name: 'assetUuid' })
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }) => value ?? null)
  description: string | null;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => ResponseSubCategoryDto)
  subCategory: ResponseSubCategoryDto;

  @Expose({ name: 'propertyValues' })
  @Type(() => ResponseAssetPropertyValueDto)
  properties: ResponseAssetPropertyValueDto[];

  @Expose()
  @Type(() => ResponseAssetHolderDto)
  activeHolder?: ResponseAssetHolderDto | null;

  @Expose()
  @Type(() => ResponseAssetLastLocationDto)
  lastLocation?: ResponseAssetLastLocationDto | null;
}
