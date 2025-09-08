import { Controller, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { RouterModule } from '@nestjs/core';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { AssetPropertyModule } from './asset-property/asset-property.module';
import { AssetModule } from './asset/asset.module';
import { AssetPropertyValueModule } from './asset-property-value/asset-property-value.module';

@Module({
  imports: [
    UserModule,
    CategoryModule,
    SubCategoryModule,
    AssetPropertyModule,
    AssetModule,
    AssetPropertyValueModule,
    RouterModule.register([
      {
        path: 'v1',
        children: [
          {
            path: '/',
            module: UserModule,
          },
          {
            path: '/category',
            module: CategoryModule
          },
          {
            path: '/sub-category',
            module: SubCategoryModule,
          },
          {
            path: '/sub-category/:subCategoryUuid/property',
            module: AssetPropertyModule,
          },
          {
            path: '/asset',
            module: AssetModule,
          },
        ],
      },
    ]),
  ],
})
export class V1Module {}

