import { IsNotEmpty, IsString, Validate } from "class-validator";
import { IsExist } from "../../../common/validators/is-exist.decorator";
import { Branch } from "../../../v1/branch/entities/branch.entity";

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  @Validate(IsExist, [Branch, 'idBranch'])
  branchId: string;
}