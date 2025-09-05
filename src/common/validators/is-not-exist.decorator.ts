import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNotExist implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, validationArguments?: ValidationArguments) {
    if (!validationArguments?.constraints) {
      return false;
    }
    const [entity, propertyName] = validationArguments.constraints;
    const repository = this.dataSource.getRepository(entity);

    const record = await repository.findOneBy({ [propertyName]: value });
    return !record;
  }

  defaultMessage(args: ValidationArguments): string {
    const [EntityClass, property] = args.constraints;
    return `${property} with value ${args.value} already exists in ${EntityClass.name}.`;
  }
}
