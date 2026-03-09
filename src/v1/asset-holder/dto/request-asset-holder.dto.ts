import { IsOptional, IsString } from "class-validator";

export class RequestAssetHolderDto {
  @IsOptional()
  @IsString()
  purpose?: string;
}
