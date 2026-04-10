import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatusType } from '../enum/asset-status.enum';

export class CreateAssetStatusDto {
    @IsEnum(AssetStatusType)
    type: AssetStatusType;

    @IsOptional()
    @IsString()
    note?: string;
}
