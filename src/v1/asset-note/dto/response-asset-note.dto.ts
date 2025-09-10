import { Expose } from 'class-transformer';

export class ResponseAssetNoteDto {
  @Expose({ name: 'assetNoteUuid' })
  id: string;

  @Expose()
  occuredAt: Date;

  @Expose()
  note: string;
}
