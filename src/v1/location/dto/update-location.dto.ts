import { IsNotEmpty, IsString } from "class-validator";

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  branch: string;
}
