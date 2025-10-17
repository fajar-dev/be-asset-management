import { IsEnum, IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';
import { Status } from '../enum/feedback.enum';

export class UpdateFeedbackDto {
  @IsEnum(Status, { message: 'Type must be one of the defined enum values' })
  status: Status;

  @IsString()
  @IsNotEmpty({ message: 'Reply must not be empty' })
  reply: string;

}
