import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '..//storage/storage.module';

@Module({
  imports: [StorageModule, ConfigModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
