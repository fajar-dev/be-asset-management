import { IsNotEmpty, IsString } from 'class-validator';

export class AssignBookDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  attachments?: Express.Multer.File[];
}
