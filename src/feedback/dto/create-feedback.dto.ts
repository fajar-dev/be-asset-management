import { IsEnum, IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';
import { Type } from '../enum/feedback.enum';

export class CreateFeedbackDto {
  @IsEnum(Type, { message: 'Type must be one of the defined enum values' })
  type: Type;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  images?: Express.Multer.File[];
}
