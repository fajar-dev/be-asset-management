import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, Validate } from "class-validator";
import { IsOptional } from "../../../common/validators/optional.decorator";
import { IsExist } from "../../../common/validators/is-exist.decorator";
import { Employee } from "../../../v1/employee/entities/employee.entity";

export class assignedAssetHolderDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  assignedAt: Date;

  @IsOptional()
  purpose: string;
  
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value))
  @Validate(IsExist, [Employee, 'idEmployee'])
  employeeId: string;

  attachments?: Express.Multer.File[];
  isRequest?: boolean;
}
