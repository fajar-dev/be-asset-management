import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Serialize } from '../common/interceptor/serialize.interceptor';
import { User } from '../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../v1/user/entities/user.entity';
import { ApiResponse } from '../common/utils/ApiResponse';
import { ResponseFeedbackDto } from './dto/response-feedback.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PreSignedUrl } from '../common/decorator/presigned-url.decorator';
import { SerializeV2Interceptor } from '..//common/interceptor/serialize-v2.interceptor';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Serialize(ResponseFeedbackDto)
  @UseInterceptors(FilesInterceptor('images', 3))
  async create(
    @Body() body: any,
    @User() user: UserEntity,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const createFeedbackDto: CreateFeedbackDto = {
      ...body,
      images,
    };

    return new ApiResponse(
      'Feedback created successfully',
      await this.feedbackService.create(user.id, createFeedbackDto),
    );
  }

  @Get()
  @PreSignedUrl([
    { originalKey: 'imagePaths', urlKey: 'imageUrls' },
  ])
  @Serialize(ResponseFeedbackDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Feedbacks retrieved successfully',
      await this.feedbackService.paginate({ page, limit, search }, user.id),
    );
  }

  @Get(':uuid')
  @PreSignedUrl([
    { originalKey: 'imagePaths', urlKey: 'imageUrls' },
  ])
  @Serialize(ResponseFeedbackDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return new ApiResponse(
      'Feedback fetched successfully',
      await this.feedbackService.findOne(uuid),
    );
  }
}
