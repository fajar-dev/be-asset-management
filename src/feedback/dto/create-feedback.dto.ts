import { IsEnum, IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';
import { Type } from '../enum/feedback.enum';

export class CreateFeedbackDto {
  @IsEnum(Type, { message: 'Type must be one of the defined enum values' })
  type: Type;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 image is required' })
  @ArrayMaxSize(3, { message: 'A maximum of 3 images is allowed' })
  @IsString({ each: true, message: 'Each image must be a string (MinIO key)' })
  imageKeys: string[];
}
