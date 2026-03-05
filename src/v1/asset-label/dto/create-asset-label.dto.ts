import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAssetLabelDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  key: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;
}
