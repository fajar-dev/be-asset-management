import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReturnBookDto {
  @IsNotEmpty()
  @IsString()
  assetHolderId: string;

  @IsNotEmpty()
  @IsString()
  purpose: string;

  attachments?: Express.Multer.File[];
}
