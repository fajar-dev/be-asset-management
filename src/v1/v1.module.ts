import { Controller, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { RouterModule } from '@nestjs/core';
import { SubCategoryModule } from './sub-category/sub-category.module';

@Module({
  imports: [
    UserModule,
    CategoryModule,
    SubCategoryModule,
    RouterModule.register([
      {
        path: 'v1',
        children: [
          {
            path: '/',
            module: UserModule,
          },
          {
            path: '/',
            module: CategoryModule
          },
          {
            path: '/',
            module: SubCategoryModule,
          },
        ],
      },
    ]),
    SubCategoryModule,
  ],
})
export class V1Module {}

