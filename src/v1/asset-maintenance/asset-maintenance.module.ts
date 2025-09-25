import { Module } from '@nestjs/common';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { AssetMaintenanceController } from './asset-maintenance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { Asset } from '../asset/entities/asset.entity';
import { APP_GUARD } from '@nestjs/core';
import { CategoryGuard } from '../category/guards/category.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AssetMaintenance, Asset])],
  controllers: [AssetMaintenanceController],
  providers: [
    AssetMaintenanceService,
    {
      provide: APP_GUARD,
      useClass: CategoryGuard,
    },
  ],
})
export class AssetMaintenanceModule {}
