import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAssetPropertyValueDto {
  @IsOptional()
  @IsString()
  valueString?: string;

  @IsOptional()
  @IsInt()
  valueInt?: number;
}
