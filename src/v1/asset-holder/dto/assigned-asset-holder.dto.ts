import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { IsOptional } from "../../../common/validators/optional.decorator";

export class assignedAssetHolderDto {
  @IsDate()
  @Type(() => Date)
  assignedAt: Date;

  @IsOptional()
  purpose: string;
  
  @IsNotEmpty()
  @IsString()
  employeeId: string;
}
