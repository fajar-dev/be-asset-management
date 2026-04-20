import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '../common/decorator/public.decorator';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get()
  async proxyFile(@Query('url') url: string, @Res() res: Response) {
    if (!url) throw new BadRequestException('url query param is required');

    try {
      const { stream, contentType } = await this.storageService.getObject(url);
      res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch (err: any) {
      if (err?.code === 'NoSuchKey') throw new NotFoundException('File not found');
      throw err;
    }
  }
}
