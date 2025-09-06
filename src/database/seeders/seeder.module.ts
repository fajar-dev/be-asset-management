import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/v1/user/entities/user.entity';
import { UserSeeder } from './user.seeder';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [
    DatabaseModule,             
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserSeeder],
  exports: [UserSeeder],
})
export class SeederModule {}
