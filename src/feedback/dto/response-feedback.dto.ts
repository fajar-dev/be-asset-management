import { Expose, Transform, Type as TransformType } from 'class-transformer';
import { Status, Type } from '../enum/feedback.enum';
import { ResponseUserDto } from '../../v1/user/dto/response-user.dto';

// This is optional, but useful if you want signed URLs instead of just keys
export class FeedbackImageDto {
  @Expose()
  originalKey: string;

  @Expose()
  signedUrl: string;
}

export class ResponseFeedbackDto {
  @Expose()
  feedbackUuid: string;

  @Expose()
  type: Type;

  @Expose()
  description: string;

  @Expose()
  status: Status;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) =>
    obj.imageKeys?.map((key: string) => ({
      originalKey: key,
      signedUrl: key,
    })),
  )
  images: FeedbackImageDto[];

  @Expose()
  @TransformType(() => ResponseUserDto)
  user: ResponseUserDto;
}
