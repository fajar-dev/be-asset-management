import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly storageService: StorageService, // for signed URLs
  ) {}

  /**
   * Create a new feedback
   * @param userId - the user submitting the feedback
   * @param dto - DTO containing feedback data
   * @returns Promise<Feedback> - the created feedback entity
   */
  async create(userId: number, dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create({
      type: dto.type,
      description: dto.description,
      images: dto.imageKeys,
      userId: userId,
      createdBy: userId,
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
  ): Promise<Pagination<Feedback>> {
    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .select([
        'feedback',
        'user.id',
        'user.userUuid',
        'user.name',
        'user.email',
      ])
      .distinct(true);

    if (options.search) {
      queryBuilder.andWhere('feedback.description LIKE :search', {
        search: `%${options.search}%`,
      });
    }

    const pagination = await paginate<Feedback>(queryBuilder, {
      limit: options.limit ?? 10,
      page: options.page ?? 1,
    });

    // map signed URLs
    for (const fb of pagination.items) {
      if (fb.images && fb.images.length > 0) {
        fb.images = await Promise.all(
          fb.images.map(async (key) => {
            const signedUrl = await this.storageService.getPreSignedUrl(key);
            return signedUrl;
          }),
        );
      }
    }
    return pagination;
  }

  /**
   * Find one feedback by UUID
   * @param uuid - UUID of the feedback
   * @returns Promise<Feedback>
   */
  async findOne(uuid: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { feedbackUuid: uuid },
      relations: ['user'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with uuid ${uuid} not found`);
    }

    if (feedback.images && feedback.images.length > 0) {
    feedback.images = await Promise.all(
      feedback.images.map(async (key) => {
        return await this.storageService.getPreSignedUrl(key);
      }),
    );
  }

    return feedback;
  }
}
