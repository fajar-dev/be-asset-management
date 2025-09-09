import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetProperty } from '../../v1/asset-property/entities/asset-property.entity';
import { SubCategory } from '../../v1/sub-category/entities/sub-category.entity';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidPropertyValue implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  private propertyName?: string;
  private expectedType?: string;
  private errorMessage?: string;

  async validate(value: any, args: ValidationArguments) {
    const { propertyId, subCategoryId } = args.object as any;
    console.log({propertyId, subCategoryId})
    if (!propertyId || !subCategoryId) {
      this.errorMessage = 'Property ID atau SubCategory tidak valid';
      return false;
    }

    const repo = this.dataSource.getRepository(AssetProperty);

    const property = await repo.findOne({
      where: {
        assetPropertyUuid: propertyId,
        subCategory: { subCategoryUuid: subCategoryId },
      },
      relations: ['subCategory'],
    });

    if (!property) {
      this.errorMessage = 'Property tidak valid untuk SubCategory ini';
      return false;
    }

    this.propertyName = property.name;
    this.expectedType = property.dataType;

    switch (property.dataType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      default:
        this.errorMessage = `Tipe data "${property.dataType}" belum didukung`;
        return false;
    }
  }

  defaultMessage(_: ValidationArguments) {
    if (this.errorMessage) return this.errorMessage;
    if (this.propertyName && this.expectedType) {
      return `Property "${this.propertyName}" must be a ${this.expectedType}`;
    }
    return 'Invalid property value';
  }
}
