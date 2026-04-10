import { Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetLogService } from '../asset-log.service';
import { AssetLogType } from '../enum/asset-log.enum';
import { User } from '../../user/entities/user.entity';

export type LogAssetMessageBuilder = (args: any[], result: any, ctx?: any) => Promise<string> | string;

export function LogAsset(message: string | LogAssetMessageBuilder, type: AssetLogType) {
  const injectAssetLogService = Inject(AssetLogService);
  const injectUserRepository = Inject(getRepositoryToken(User));

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Inject dependencies into the target prototype
    injectAssetLogService(target, '__assetLogService__');
    injectUserRepository(target, '__userRepository__');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      try {
        const assetLogService: AssetLogService = this.__assetLogService__ || this.assetLogService;
        const userRepository: Repository<User> = this.__userRepository__ || this.userRepository;

        if (assetLogService && userRepository) {
          // Determine userId from arguments (assuming it's passed as a number)
          const userId = args.find((arg) => typeof arg === 'number');

          // Extract assetUuid from result or args
          let assetUuid = result?.assetUuid;
          if (!assetUuid) {
            // Fallback: look for a UUID string in the arguments
            assetUuid = args.find(
              (arg) => typeof arg === 'string' && arg.length === 36,
            );
          }

          if (userId && assetUuid) {
            const finalMessage = typeof message === 'string' 
              ? message 
              : await message(args, result, this);
              
            await assetLogService.create(userId, assetUuid, finalMessage, type);
          }
        }
      } catch (error) {
        // We log the error but don't throw it to avoid breaking the main operation
        console.error(`Failed to log asset action for method ${propertyKey}:`, error);
      }

      return result;
    };

    return descriptor;
  };
}
