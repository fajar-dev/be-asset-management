import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';
import { ImageUploadValidator } from '../../common/validators/image-upload.validator';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Public } from '../../common/decorator/public.decorator';

@Controller()
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('scan-barcode')
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  async scanBarcode(
    @UploadedFile(ImageUploadValidator) image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    const result = await this.geminiService.parseImage(image);
    return new ApiResponse('Barcode scanned successfully', result);
  }
}
