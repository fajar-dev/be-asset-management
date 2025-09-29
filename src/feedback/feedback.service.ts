import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { StorageService } from '../storage/storage.service';

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
    userId: number,
  ): Promise<Pagination<Feedback>> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .where('feedback.userId = :userId', { userId })

    if (options.search) {
      queryBuilder.andWhere('feedback.description LIKE :search', {
        search: `%${options.search}%`,
      });
    }

    return paginate<Feedback>(queryBuilder, {
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

}
