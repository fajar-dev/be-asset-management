import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetPropertyValue } from './entities/asset-property-value.entity';
import { AssetPropertyValueService } from './asset-property-value.service';
import { AssetProperty } from '../asset-property/entities/asset-property.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AssetPropertyValue, AssetProperty])],
    providers: [AssetPropertyValueService],
    exports: [AssetPropertyValueService], 
})
export class AssetPropertyValueModule {}
