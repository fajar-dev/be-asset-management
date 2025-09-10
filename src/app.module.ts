import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { V1Module } from './v1/v1.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CatchEverythingFilter } from './common/filters/http-exception.filter';
import { IsNotExist } from './common/validators/is-not-exist.decorator';
import { IsExist } from './common/validators/is-exist.decorator';
import { AuthModule } from './auth/auth.module';
import { IsValidPropertyValue } from './common/validators/is-valid-property-value.decorator';
import { AreAllPropertiesFilled } from './common/validators/are-all-properties-filled.decorator';
import { CategoryGuard } from './common/guards/category.guard';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    DatabaseModule, 
    AuthModule,
    V1Module
  ],
    providers: [
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    IsNotExist,
    IsExist,
    AreAllPropertiesFilled,
    IsValidPropertyValue
  ],
})
export class AppModule {}
