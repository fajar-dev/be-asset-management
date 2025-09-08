import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetProperty } from '../../v1/asset-property/entities/asset-property.entity';

@ValidatorConstraint({ async: true })
@Injectable()
export class AreAllPropertiesFilled implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(properties: any[], args: ValidationArguments) {
    const subCategoryId = (args.object as any).subCategoryId;
    if (!subCategoryId) return false;

    const repo = this.dataSource.getRepository(AssetProperty);
    const requiredProperties = await repo.find({
      where: { subCategory: { subCategoryUuid: subCategoryId } },
    });

    if (!requiredProperties.length) {
      return true;
    }

    const providedIds = properties?.map((p) => p.propertyId) ?? [];

    const missing = requiredProperties.filter(
      (prop) => !providedIds.includes(prop.assetPropertyUuid),
    );

    if (missing.length > 0) {
      (args as any).missingProps = missing.map((m) => m.name);
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const missing = (args as any).missingProps;
    if (missing?.length) {
      return `Missing required properties: ${missing.join(', ')}`;
    }
    return `All properties for this subCategory must be provided`;
  }
}
