import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueExceptSelfConstraint implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [tableName, column, idColumn = 'id'] = args.constraints;
    const object = args.object as any;
    const currentId = object[idColumn];

    if (!value) {
      return true;
    }

    if (!currentId) {
      return true;
    }

    const query = this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(tableName, tableName)
      .where(`${column} = :value`, { value })
      .andWhere(`${idColumn} != :id`, { id: currentId });

    const result = await query.getRawOne();
    
    return parseInt(result.count) === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [, column] = args.constraints;
    return `${column} sudah digunakan`;
  }
}

export function IsUniqueExceptSelf(
  tableName: string,
  column: string,
  idColumn?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, column, idColumn],
      validator: IsUniqueExceptSelfConstraint,
    });
  };
}