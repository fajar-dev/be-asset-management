import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class assignedAssetHolderDto {
  @IsDate()
  @Type(() => Date)
  assignedAt: Date;
  
  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
