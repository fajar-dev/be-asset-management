import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateAssetPropertyValueDto } from './create-asset-property-value.dto';

export class CreateManyAssetPropertyValuesDto {
  @ValidateNested({ each: true })
  @Type(() => CreateAssetPropertyValueDto)
  values: CreateAssetPropertyValueDto[];
}
