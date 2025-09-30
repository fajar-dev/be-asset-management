import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  hasMaintenance: boolean;

  @IsBoolean()
  hasHolder: boolean;
}