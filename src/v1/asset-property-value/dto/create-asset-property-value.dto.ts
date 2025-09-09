import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAssetPropertyValueDto {
  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  valueString?: string;

  @IsOptional()
  @IsInt()
  valueInt?: number;
}
