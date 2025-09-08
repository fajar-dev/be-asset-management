import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
import { SubCategory } from '../sub-category/entities/sub-category.entity';
import { AssetPropertyValue } from '../asset-property-value/entities/asset-property-value.entity';
import { AssetPropertyValueService } from '../asset-property-value/asset-property-value.service';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    private readonly assetPropertyValueService: AssetPropertyValueService,
  ) {}
  
  /**
    * Create a new asset
    * @param createAssetdto - DTO containing data to create a asset
    * @returns Promise<SubCategory> - the created asset entity
  */
  async create(
    userId: number,
    createAssetDto: CreateAssetDto,
  ): Promise<Asset> {
    const subCategory = await this.subCategoryRepository.findOneOrFail({
      where: { subCategoryUuid: createAssetDto.subCategoryId }
    });
    const asset = this.assetRepository.create({
      subCategoryId: subCategory.id,
      name:createAssetDto.name,
      code: createAssetDto.code,
      description: createAssetDto.description,
      brand: createAssetDto.brand,
      model: createAssetDto.model,
      createdBy: userId
    });
    const savedAsset = await this.assetRepository.save(asset);

    // if (createAssetDto.properties?.length) {
    //   await this.assetPropertyValueService.createMany(
    //     userId,
    //     savedAsset.id,
    //     createAssetDto.properties,
    //   );
    // }
    return savedAsset
  }
}
