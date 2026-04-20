import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [],
  controllers: [StorageController],
  exports: [StorageService],
  providers: [StorageService],
})
export class StorageModule {}
