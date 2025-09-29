import { Expose, Type as TransformType } from 'class-transformer';
import { Status, Type } from '../enum/feedback.enum';
import { ResponseUserDto } from '../../v1/user/dto/response-user.dto';

export class ResponseFeedbackDto {
  @Expose({ name: 'feedbackUuid' })
  id: string;

  @Expose()
  type: Type;

  @Expose()
  description: string;

  @Expose()
  status: Status;

  @Expose()
  reply: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  imagePaths: string[];

  @Expose()
  @TransformType(() => ResponseUserDto)
  user: ResponseUserDto;
}
