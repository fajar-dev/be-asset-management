import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from 'src/v1/asset/entities/asset.entity';
import { Category } from 'src/v1/category/entities/category.entity';
import { SubCategory } from 'src/v1/sub-category/entities/sub-category.entity';
import { AssetHolder } from 'src/v1/asset-holder/entities/asset-holder.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { StorageModule } from 'src/storage/storage.module';
import { SerializeV2Interceptor } from 'src/common/interceptor/serialize-v2.interceptor';
import { Reflector } from '@nestjs/core';
import { AssetHolderModule } from 'src/v1/asset-holder/asset-holder.module';
import { UserModule } from 'src/v1/user/user.module';
import { ApiKeyGuard } from 'src/auth/guards/ApiKeyGuard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, Category, SubCategory, AssetHolder]),
    StorageModule,
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
