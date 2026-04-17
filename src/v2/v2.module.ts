import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { BookModule } from './book/book.module';
import { ApiKeyGuard } from '../auth/guards/ApiKeyGuard';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/role.guard';
import { UserModule } from '../v1/user/user.module';

@Module({
  imports: [
    BookModule,
    UserModule,
    RouterModule.register([
      {
        path: 'v2',
        children: [
          {
            path: '/book',
            module: BookModule,
          },
        ],
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class V2Module {}
