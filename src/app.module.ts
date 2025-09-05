import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { V1Module } from './v1/v1.module';
import { APP_FILTER } from '@nestjs/core';
import { CatchEverythingFilter } from './common/filters/http-exception.filter';
import { IsNotExist } from './common/validators/is-not-exist.decorator';
import { IsExist } from './common/validators/is-exist.decorator';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule, 
    V1Module, AuthModule
  ],
    providers: [
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    IsNotExist,
    IsExist,
  ],
})
export class AppModule {}
