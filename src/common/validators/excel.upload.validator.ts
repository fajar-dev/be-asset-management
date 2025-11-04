import {
  ParseFilePipeBuilder,
  FileTypeValidator,
} from '@nestjs/common'

export const ExcelUploadValidator = new ParseFilePipeBuilder()
  .addValidator(
    new FileTypeValidator({
      fileType:
        /(application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
    }),
  )
  .build({
    fileIsRequired: true,
  })
