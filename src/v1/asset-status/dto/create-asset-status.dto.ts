import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatusType } from '../enum/asset-status.enum';

export class CreateAssetStatusDto {
    @IsEnum(AssetStatusType)
    type: AssetStatusType;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isTransferred?: boolean;

    attachments?: Express.Multer.File[];
}
