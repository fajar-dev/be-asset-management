import { Expose, Transform, Type } from 'class-transformer';
import { ResponseSubCategoryDto } from '../../sub-category/dto/response-sub-category.dto';
import { ResponseEmployeeDto } from '../../../v1/employee/dto/response-employee.dto';
import { Status } from '../enum/asset.enum';
import { ResponseBranchDto } from '../../../v1/branch/dto/response-branch.dto';

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

export class ResponseCustomValueDto {
  @Expose()
  name: string;

  @Expose()
  value: string;
}

export class ResponseAssetDto {
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

  @Expose({ name: 'customValues' })
  @Type(() => ResponseCustomValueDto)
  customValues: ResponseCustomValueDto[];

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.purchaseDate) return null;

    const purchaseDate = new Date(obj.purchaseDate);
    const now = new Date();

    let years = now.getFullYear() - purchaseDate.getFullYear();
    let months = now.getMonth() - purchaseDate.getMonth();
    let days = now.getDate() - purchaseDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  })
  age: string | null;
}
