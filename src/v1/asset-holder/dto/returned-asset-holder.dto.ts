import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class returnedAssetHolderDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  returnedAt: Date;

  attachments?: Express.Multer.File[];
}
