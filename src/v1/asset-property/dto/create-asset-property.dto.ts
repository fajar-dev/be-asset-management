import { IsEnum, IsNotEmpty, IsString, MaxLength} from 'class-validator';
import { DataType } from '../asset-property.enum';
export class CreateAssetPropertyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsEnum(DataType)
  dataType: DataType;
}