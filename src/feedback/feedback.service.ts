import { BadRequestException, Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { StorageService } from '../storage/storage.service';

export interface FeedbackApiItem {
  timestamp: string;
  email: string;
  image: string[];
  url: string;
  category: string;
  message: string;
  type: string;
  reply: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new feedback
   * @param email - the user submitting the feedback
   * @param dto - DTO containing feedback data
   * @returns Promise<Feedback> - the created feedback entity
   */
  async create(email: string, dto: CreateFeedbackDto): Promise<void> {
    if (!dto.images || dto.images.length < 1 || dto.images.length > 3) {
      throw new BadRequestException('Images must be between 1 and 3 files');
    }

    const uploadPromises = dto.images.map(file =>
      this.storageService.uploadFile('feedback', file),
    );
    const uploadedPaths = (await Promise.all(uploadPromises)).filter(
      (path): path is string => !!path,
    );

    const scriptUrl = this.configService.getOrThrow<string>('FEEDBACK_SCRIPT_URL');
    await axios.post(scriptUrl, {
      email: email,
      image: uploadedPaths,
      url: dto.url,
      type: dto.type,
      message: dto.description,
    });
  }

  async paginate(
    options: IPaginationOptions & { search?: string },
    email: string,
  ): Promise<Pagination<FeedbackApiItem>> {
    const scriptUrl = this.configService.getOrThrow<string>('FEEDBACK_SCRIPT_URL');
    const { data } = await axios.get<FeedbackApiItem[]>(scriptUrl);

    let items = data.filter(item => item.email === email);

    if (options.search) {
      const keyword = options.search.toLowerCase();
      items = items.filter(item =>
        item.message.toLowerCase().includes(keyword),
      );
    }

    const totalItems = items.length;
    const currentPage = +options.page || 1;
    const limit = +options.limit || 10;
    const offset = (currentPage - 1) * limit;
    const pagedItems = items.slice(offset, offset + limit);

    return new Pagination<FeedbackApiItem>(pagedItems, {
      totalItems,
      itemCount: pagedItems.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage,
    });
  }
}
