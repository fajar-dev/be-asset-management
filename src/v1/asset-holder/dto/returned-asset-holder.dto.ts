import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class returnedAssetHolderDto {
  @IsDate()
  @Type(() => Date)
  returnedAt: Date;
}
