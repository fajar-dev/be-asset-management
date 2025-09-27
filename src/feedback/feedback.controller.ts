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
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Serialize } from '../common/interceptor/serialize.interceptor';
import { User } from '../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../v1/user/entities/user.entity';
import { ApiResponse } from '../common/utils/ApiResponse';
import { ResponseFeedbackDto } from './dto/response-feedback.dto';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Serialize(ResponseFeedbackDto)
    @UseInterceptors(FilesInterceptor('files', 3)) // min 1, max 3 files
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Feedback created successfully',
      await this.feedbackService.create(user.id, createFeedbackDto),
    );
  }

  @Get()
  @Serialize(ResponseFeedbackDto)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Feedbacks retrieved successfully',
      await this.feedbackService.paginate({ page, limit, search }),
    );
  }

  @Get(':uuid')
  @Serialize(ResponseFeedbackDto)
  async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return new ApiResponse(
      'Feedback fetched successfully',
      await this.feedbackService.findOne(uuid),
    );
  }
}
