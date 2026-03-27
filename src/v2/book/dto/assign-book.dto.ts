import { IsNotEmpty, IsString } from 'class-validator';

export class AssignBookDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  purpose: string;
}
