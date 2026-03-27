import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnBookDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsString()
  assetHolderId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
