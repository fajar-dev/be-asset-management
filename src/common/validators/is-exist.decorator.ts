import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExist implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    if (!args?.constraints) return false;

    const [EntityClass, propertyName] = args.constraints;
    const repository = this.dataSource.getRepository(EntityClass);

    if (!value) return false;

    const record = await repository.findOne({
      where: {
        [propertyName]: value,
        deletedAt: null, // ignore soft-deleted rows
      },
    });

    return !!record;
  }

  defaultMessage(args: ValidationArguments): string {
    const [EntityClass, property] = args.constraints;
    return `${EntityClass.name} with ${property} = ${args.value} does not exist or has been deleted`;
  }
}
