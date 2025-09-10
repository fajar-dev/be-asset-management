import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateAssetNoteDto {
  @IsDate()
  @Type(() => Date)
  occuredAt: Date;
  
  @IsNotEmpty()
  @IsString()
  note: string;
}
