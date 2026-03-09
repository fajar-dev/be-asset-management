import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import { AssetHolderModule } from '../asset-holder/asset-holder.module';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AssetHolderModule, StorageModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
