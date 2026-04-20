import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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
import { SerializeV2Interceptor } from '../common/interceptor/serialize-v2.interceptor';
import { FeedbackApiItem } from './feedback.service';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
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

    await this.feedbackService.create(user.email, createFeedbackDto);
    return new ApiResponse('Feedback submitted successfully', null);
  }

  @Get()
  @PreSignedUrl([
    { originalKey: 'image', urlKey: 'imageUrls' },
  ])
  @Serialize(ResponseFeedbackDto)
  @UseInterceptors(SerializeV2Interceptor)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
    @User() user: UserEntity,
  ): Promise<ApiResponse<Pagination<FeedbackApiItem>>> {
    const feedbacks = await this.feedbackService.paginate(
      { page: +page, limit: +limit, search },
      user.email
    );
    return new ApiResponse('Feedback retrieved successfully', feedbacks);
  }
}
