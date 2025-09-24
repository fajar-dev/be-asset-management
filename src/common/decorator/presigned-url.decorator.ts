import { Transform } from 'class-transformer';
import { StorageService } from '../../storage/storage.service'; // sesuaikan path
import { ConfigService } from '@nestjs/config';

// kita cache StorageService biar gak new berkali-kali
const storageService = new StorageService(new ConfigService());

export function PreSignedUrl(pathKey: string) {
  return Transform(({ obj }) => {
    if (!obj[pathKey]) return null;
    return storageService.getPreSignedUrl(obj[pathKey]);
  });
}
