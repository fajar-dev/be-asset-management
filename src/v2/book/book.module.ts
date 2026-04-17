import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../../v1/asset/entities/asset.entity';
import { Category } from '../../v1/category/entities/category.entity';
import { SubCategory } from '../../v1/sub-category/entities/sub-category.entity';
import { AssetHolder } from '../../v1/asset-holder/entities/asset-holder.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { StorageModule } from '../../storage/storage.module';
import { SerializeV2Interceptor } from '../../common/interceptor/serialize-v2.interceptor';
import { Reflector } from '@nestjs/core';
import { AssetHolderModule } from '../../v1/asset-holder/asset-holder.module';
import { UserModule } from '../../v1/user/user.module';
import { ApiKeyGuard } from '../../auth/guards/ApiKeyGuard';
import { Employee } from '../../v1/employee/entities/employee.entity';
import { AssetLogModule } from '../../v1/asset-log/asset-log.module';
import { User } from '../../v1/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Category, SubCategory, AssetHolder, Employee, User]),
    StorageModule,
    AssetLogModule,
    AssetHolderModule,
    UserModule,
  ],
  controllers: [BookController],
  providers: [
    BookService,
    SerializeV2Interceptor,
    Reflector,
    ApiKeyGuard,
  ],
})
export class BookModule {}
