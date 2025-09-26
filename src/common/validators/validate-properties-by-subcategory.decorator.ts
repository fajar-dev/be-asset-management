import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SubCategory } from '../../v1/sub-category/entities/sub-category.entity';

@Injectable()
@ValidatorConstraint({ async: true })
export class ValidatePropertiesBySubCategoryConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!Array.isArray(value)) return false;

    const [subCategoryFieldName] = args.constraints;
    const subCategoryId = (args.object as any)[subCategoryFieldName];
    if (!subCategoryId) return false;

    const subCategoryRepo = this.dataSource.getRepository(SubCategory);
    const subCategory = await subCategoryRepo.findOne({
      where: { subCategoryUuid: subCategoryId },
      relations: ['assetProperties'],
    });

    if (!subCategory) return false;

    // number of properties must match
    if (subCategory.assetProperties.length !== value.length) {
      return false;
    }

    for (const prop of subCategory.assetProperties) {
      const incoming = value.find((p) => p.id === prop.assetPropertyUuid);
      if (!incoming) {
        return false;
      }

      // validate data type
      const v = incoming.value;
      switch (prop.dataType) {
        case 'number':
          if (typeof v !== 'number') {
            return false;
          }
          break;
        case 'string':
          if (typeof v !== 'string') {
            return false;
          }
          break;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Properties do not match the definition of the selected subCategory.`;
  }
}

export function ValidatePropertiesBySubCategory(
  subCategoryField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [subCategoryField],
      validator: ValidatePropertiesBySubCategoryConstraint,
    });
  };
}
