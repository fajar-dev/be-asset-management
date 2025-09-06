import { Controller, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    UserModule,
    CategoryModule,
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
            module: CategoryModule,
          },
        ],
      },
    ]),
  ],
})
export class V1Module {}

