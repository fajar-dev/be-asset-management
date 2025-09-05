import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  has_location?: boolean;

  @IsOptional()
  @IsBoolean()
  has_maintenance?: boolean;

  @IsOptional()
  @IsBoolean()
  has_holder?: boolean;
}