import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateAssetMaintenanceDto {
  @IsDate()
  @Type(() => Date)
  maintenanceAt: Date;
  
  @IsNotEmpty()
  @IsString()
  note: string;
}
