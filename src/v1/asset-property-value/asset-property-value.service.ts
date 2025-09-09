import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetPropertyValue } from './entities/asset-property-value.entity';
import { Repository } from 'typeorm';
import { AssetProperty } from '../asset-property/entities/asset-property.entity';
import { CreateAssetPropertyValueDto } from './dto/create-asset-property-value.dto';
import { UpdateAssetPropertyValueDto } from './dto/update-asset-property-value.dto';

@Injectable()
export class AssetPropertyValueService {
constructor(
    @InjectRepository(AssetPropertyValue)
    private readonly assetPropertyValueRepository: Repository<AssetPropertyValue>,
    @InjectRepository(AssetProperty)
    private readonly assetPropertyRepository: Repository<AssetProperty>
  ) {}

  /**
    * Create a new asset
    * @param createAssetdto - DTO containing data to create a asset
    * @returns Promise<SubCategory> - the created asset entity
  */
  async createMany(
    userId: number,
    assetId: number,
    values: CreateAssetPropertyValueDto[],
  ): Promise<AssetPropertyValue[]> {
    const propertyValues: AssetPropertyValue[] = [];
    for (const v of values) {
      const property = await this.assetPropertyRepository.findOneOrFail({
        where: { assetPropertyUuid: v.propertyId },
      });
      const value = this.assetPropertyValueRepository.create({
        assetId,
        propertyId: property.id,
        valueString: v.valueString ?? null,
        valueInt: v.valueInt ?? null,
        createdBy: userId,
      });
      propertyValues.push(value);
    }

    return this.assetPropertyValueRepository.save(propertyValues);
  }
}
