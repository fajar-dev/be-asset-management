import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetHolder } from './entities/asset-holder.entity';
import { Asset } from '../asset/entities/asset.entity';
import { AssetHolderController } from './asset-holder.controller';
import { AssetHolderService } from './asset-holder.service';
import { Employee } from '../employee/entities/employee.entity';
import { APP_GUARD } from '@nestjs/core';
import { CategoryGuard } from '../category/guards/category.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AssetHolder, Asset, Employee])], 
  controllers: [AssetHolderController],
  providers: 
  [
    AssetHolderService,
    {
      provide: APP_GUARD,
      useClass: CategoryGuard,
    },
  ],

})
export class AssetHolderModule {}

