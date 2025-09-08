import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export enum AssetPropertyDataType {
  STRING = 'string',
  NUMBER = 'number',
}

export class UpdateAssetPropertyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEnum(AssetPropertyDataType)
  dataType: AssetPropertyDataType;
}