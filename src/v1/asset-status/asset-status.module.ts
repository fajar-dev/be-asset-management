import { Module } from '@nestjs/common';
import { AssetStatusService } from './asset-status.service';
import { AssetStatusController } from './asset-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetStatus } from './entities/asset-status.entity';
import { Asset } from '../asset/entities/asset.entity';
import { AssetLogModule } from '../asset-log/asset-log.module';
import { User } from '../user/entities/user.entity';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetStatus, Asset, User]),
    AssetLogModule,
    StorageModule,
  ],
  controllers: [AssetStatusController],
  providers: [AssetStatusService],
})
export class AssetStatusModule {}
