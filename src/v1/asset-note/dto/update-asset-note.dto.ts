import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class UpdateAssetNoteDto {
  @IsDate()
  @Type(() => Date)
  occuredAt: Date;
  
  @IsNotEmpty()
  @IsString()
  note: string;
}
