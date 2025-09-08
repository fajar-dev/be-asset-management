import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator';

export enum AssetPropertyDataType {
  STRING = 'string',
  NUMBER = 'number',
}

export class CreateAssetPropertyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEnum(AssetPropertyDataType)
  dataType: AssetPropertyDataType;
}