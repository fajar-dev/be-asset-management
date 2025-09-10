import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SubCategory } from 'src/v1/sub-category/entities/sub-category.entity';

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

    // jumlah harus sama
    if (subCategory.assetProperties.length !== value.length) {
      console.error(
        `❌ Jumlah properties tidak sesuai. Diharapkan: ${subCategory.assetProperties.length}, diterima: ${value.length}`,
      );
      return false;
    }

    for (const prop of subCategory.assetProperties) {
      const incoming = value.find((p) => p.id === prop.assetPropertyUuid);
      if (!incoming) {
        console.error(
          `❌ Property "${prop.name}" (UUID: ${prop.assetPropertyUuid}) tidak ditemukan di request`,
        );
        return false;
      }

      // validasi tipe data
      const v = incoming.value;
      switch (prop.dataType) {
        case 'number':
          if (typeof v !== 'number') {
            console.error(
              `❌ Property "${prop.name}" harus number, dapat: ${typeof v}`,
            );
            return false;
          }
          break;
        case 'string':
          if (typeof v !== 'string') {
            console.error(
              `❌ Property "${prop.name}" harus string, dapat: ${typeof v}`,
            );
            return false;
          }
          break;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Properties tidak sesuai dengan definisi subCategory.`;
  }
}

// decorator factory
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
