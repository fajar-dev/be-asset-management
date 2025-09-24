import {
  ParseFilePipeBuilder,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

export const ImageUploadValidator = new ParseFilePipeBuilder()
  .addValidator(
    new MaxFileSizeValidator({
      maxSize: 2 * 1024 * 1024, // 2MB
      message: 'File terlalu besar, maksimal 2MB',
    }),
  )
  .addValidator(
    new FileTypeValidator({
      fileType: /(jpg|jpeg|png)$/, // hanya gambar
    }),
  )
  .build({
    fileIsRequired: false, // boleh optional
  });
