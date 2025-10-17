import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { StorageService } from '../storage/storage.service';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new feedback
   * @param userId - the user submitting the feedback
   * @param dto - DTO containing feedback data
   * @returns Promise<Feedback> - the created feedback entity
   */
  async create(userId: number, dto: CreateFeedbackDto): Promise<Feedback> {
  if (!dto.images || dto.images.length < 1 || dto.images.length > 3) {
    throw new BadRequestException('Images must be between 1 and 3 files');
  }

  const uploadedPaths: string[] = [];
  for (const file of dto.images) {
    const objectPath = await this.storageService.uploadFile('feedback', file);
    if (objectPath){
      uploadedPaths.push(objectPath);
    }
  }

  const feedback = this.feedbackRepository.create({
    type: dto.type,
    description: dto.description,
    createdBy: userId,
    imagePaths: uploadedPaths,
    userId: userId,
  });

  return this.feedbackRepository.save(feedback);
}


  /**
   * Paginate feedbacks with optional search
   * @param options - Pagination options plus optional search string
   * @returns Promise<Pagination<Feedback>>
   */
  async paginate(
    options: IPaginationOptions & { search?: string },
    userId?: number, // optional
  ): Promise<Pagination<Feedback>> {
    const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');

    if (userId) {
      queryBuilder.where('feedback.userId = :userId', { userId });
    }

    if (options.search) {
      if (userId) {
        queryBuilder.andWhere('feedback.description LIKE :search', {
          search: `%${options.search}%`,
        });
      } else {
        queryBuilder.where('feedback.description LIKE :search', {
          search: `%${options.search}%`,
        });
      }
    }

    return paginate(queryBuilder, {
      limit: options.limit ?? 10,
      page: options.page ?? 1,
    });
  }



  /**
   * Find one feedback by UUID
   * @param uuid - UUID of the feedback
   * @returns Promise<Feedback>
   */
  async findOne(uuid: string): Promise<Feedback> {
    return await this.feedbackRepository.findOneOrFail({
      where: { feedbackUuid: uuid },
      relations: ['user'],
    });
  }
  
  /**
   * Update a feedback by UUID
   * @param uuid - UUID of the feedback to update
   * @param updateFeedbackDto - DTO containing updated feedback data
   * @returns Promise<Feedback> - the updated feedback entity
   * @throws NotFoundException if feedback is not found
   */
  async update(
    uuid: string,
    userId: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOneOrFail({
      where: {
        feedbackUuid: uuid,
      },
    });

    feedback.status = updateFeedbackDto.status;
    feedback.reply = updateFeedbackDto.reply;
    feedback.updatedBy = userId;
    return this.feedbackRepository.save(feedback);
  }
}
