import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetPropertyValue } from './entities/asset-property-value.entity';
import { AssetProperty } from '../asset-property/entities/asset-property.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AssetPropertyValue])], 
})
export class AssetPropertyValueModule {}
