import { Module } from '@nestjs/common';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { AssetMaintenanceController } from './asset-maintenance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { Asset } from '../asset/entities/asset.entity';
import { APP_GUARD } from '@nestjs/core';
import { CategoryGuard } from '../category/guards/category.guard';
import { AssetLogModule } from '../asset-log/asset-log.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetMaintenance, Asset, User]),
    AssetLogModule
  ],
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
