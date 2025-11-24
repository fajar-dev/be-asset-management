import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class StorageService {
  private minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow('MINIO_STORAGE_ENDPOINT'),
      port: Number(this.configService.getOrThrow('MINIO_STORAGE_PORT')),
      useSSL: this.configService.getOrThrow('MINIO_STORAGE_SSL') === 'true',
      accessKey: this.configService.getOrThrow('MINIO_STORAGE_KEY'),
      secretKey: this.configService.getOrThrow('MINIO_STORAGE_SECRET'),
      // region: 'us-east-1',
    });
  }

  public async uploadFile(filePath: string, file: Express.Multer.File) {
    if (!file) return undefined;

    const uuid = uuidv7();
    const extension = file.originalname.split('.').pop();
    const objectName = `${filePath}/${uuid}.${extension}`;

    await this.minioClient.putObject(
      this.configService.getOrThrow('MINIO_STORAGE_BUCKET'),
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return objectName;
  }

  public async deleteFile(filePath: string) {
    await this.minioClient.removeObject(
      this.configService.getOrThrow('MINIO_STORAGE_BUCKET'),
      filePath,
    );
  }

  public async getPreSignedUrl(filePath: string, expiry: number = 60 * 60) {
    return await this.minioClient.presignedGetObject(
      this.configService.getOrThrow('MINIO_STORAGE_BUCKET'),
      filePath,
      expiry,
    );
  }
}
