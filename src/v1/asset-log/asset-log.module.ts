import { Module } from '@nestjs/common';
import { AssetLogService } from './asset-log.service';
import { AssetLogController } from './asset-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLog } from './entities/asset-log.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Employee } from '../employee/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetLog, Asset, Employee])], 
  controllers: [AssetLogController],
  providers: [AssetLogService],
  exports: [AssetLogService],
})
export class AssetLogModule {}
