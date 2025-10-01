import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetPropertyValue } from './entities/asset-property-value.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AssetPropertyValue])], 
})
export class AssetPropertyValueModule {}
