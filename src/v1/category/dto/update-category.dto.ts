import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  hasLocation: boolean;

  @IsBoolean()
  hasMaintenance: boolean;

  @IsBoolean()
  hasHolder: boolean;
}