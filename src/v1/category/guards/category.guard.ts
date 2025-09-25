import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../../asset/entities/asset.entity';

@Injectable()
export class CategoryGuard implements CanActivate {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { assetUuid } = req.params;
    const url: string = req.url;

    console.log('Guard running on:', url);

    if (!assetUuid) return true;

    const asset = await this.assetRepo.findOne({
      where: { assetUuid },
      relations: ['subCategory', 'subCategory.category'],
    });

    if (!asset) throw new ForbiddenException('Asset not found');
    const category = asset.subCategory?.category;

    if (url.includes('maintenance') && !category.hasMaintenance) {
      throw new ForbiddenException('Maintenance disabled for this category');
    }
    if (url.includes('location') && !category.hasLocation) {
      throw new ForbiddenException('Location disabled for this category');
    }
    if (url.includes('holder') && !category.hasHolder) {
      throw new ForbiddenException('Holder disabled for this category');
    }

    return true;
  }
}
