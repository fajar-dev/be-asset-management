import { Expose, Type } from 'class-transformer';
import { ResponseBookDto } from './response-book.dto';

export class ResponseBookLoanDto {
  @Expose({ name: 'assetHolderUuid' })
  id: string;

  @Expose()
  purpose: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt: Date | null;

  @Expose()
  attachmentPaths: string[];

  @Expose()
  attachmentUrls: string[];

  @Expose()
  isRequest: boolean;

  @Expose()
  @Type(() => ResponseBookDto)
  asset: ResponseBookDto;
}
