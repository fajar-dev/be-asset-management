import { Expose, Transform, Type } from 'class-transformer';
export class ResponseUserSimpleDto {
  @Expose()
  name: string;

  @Expose()
  employeeId: string;
}

class AssetBranchDto {
  @Expose({ name: 'idBranch' })
  branchId: string;

  @Expose()
  name: string;
}

class AssetEmployeeDto {
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
  @Type(() => AssetBranchDto)
  branch: AssetBranchDto;
}

class AssetCategoryDto {
  @Expose({ name: 'categoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  hasLocation: boolean;

  @Expose()
  hasMaintenance: boolean;

  @Expose()
  hasHolder: boolean;
}

class AssetPropertyDto {
  @Expose({ name: 'assetPropertyUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  dataType: string;
}

class AssetSubCategoryDto {
  @Expose({ name: 'subCategoryUuid' })
  id: string;

  @Expose()
  name: string;

  @Expose()
  level: number;

  @Expose()
  labels: string[] | null;

  @Expose()
  @Type(() => AssetCategoryDto)
  category: AssetCategoryDto;

  @Expose()
  @Type(() => AssetSubCategoryDto)
  parent: AssetSubCategoryDto | null;

  @Expose()
  @Type(() => AssetSubCategoryDto)
  children: AssetSubCategoryDto[];

  @Expose()
  @Type(() => AssetPropertyDto)
  assetProperties: AssetPropertyDto[];
}

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
  @Type(() => AssetEmployeeDto)
  employee: AssetEmployeeDto;
}

export class ResponseAssetLastLocationDto {
  @Expose({ name: 'assetLocationUuid' })
  id: string;

  @Expose({ name: 'locationUuid' })
  locationId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => AssetBranchDto)
  branch: AssetBranchDto;
}

export class ResponseAssetStatusDto {
  @Expose({ name: 'assetStatusUuid' })
  id: string;

  @Expose()
  type: string;

  @Expose()
  note: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ResponseUserSimpleDto)
  user: ResponseUserSimpleDto;
}

export class ResponseAssetLabelDto {
  @Expose()
  key: string;

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
  isLendable: boolean;

  @Expose()
  @Type(() => AssetSubCategoryDto)
  subCategory: AssetSubCategoryDto;

  @Expose({ name: 'propertyValues' })
  @Type(() => ResponseAssetPropertyValueDto)
  properties: ResponseAssetPropertyValueDto[];

  @Expose()
  @Type(() => ResponseAssetHolderDto)
  activeHolder?: ResponseAssetHolderDto | null;

  @Expose()
  @Type(() => ResponseAssetLastLocationDto)
  lastLocation?: ResponseAssetLastLocationDto | null;

  @Expose()
  @Type(() => ResponseAssetStatusDto)
  lastStatus?: ResponseAssetStatusDto | null;

  @Expose({ name: 'labelRecords' })
  @Type(() => ResponseAssetLabelDto)
  labels: ResponseAssetLabelDto[];

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
