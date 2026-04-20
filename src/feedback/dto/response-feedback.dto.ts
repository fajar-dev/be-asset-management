import { Expose } from 'class-transformer';

export class ResponseFeedbackDto {
  @Expose()
  timestamp: string;

  @Expose()
  email: string;

  @Expose()
  image: string[];

  @Expose()
  imageUrls: string[];

  @Expose()
  url: string;

  @Expose()
  category: string;

  @Expose()
  message: string;

  @Expose()
  type: string;

  @Expose()
  status: string;

  @Expose()
  reply: string;
}
