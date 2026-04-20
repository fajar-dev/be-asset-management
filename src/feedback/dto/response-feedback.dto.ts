import { Expose, Type as TransformType } from 'class-transformer';
import { Status, Type } from '../enum/feedback.enum';

class FeedbackUserDto {
  @Expose({ name: 'userUuid' })
  id: number;

  @Expose()
  employeeId: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  lastLoginIp: string | null;

  @Expose()
  phoneNumber: string | null;

  @Expose()
  role: string;
}

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
  @TransformType(() => FeedbackUserDto)
  user: FeedbackUserDto;
}
