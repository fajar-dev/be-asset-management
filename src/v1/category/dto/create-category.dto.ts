import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
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