import { switchMap } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '../utils/ApiResponse';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  PRESIGNED_URL_METADATA,
  PreSignedUrlObject,
} from '../decorator/presigned-url.decorator';
import { StorageService } from '../../storage/storage.service';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { DTO_METADATA } from '../decorator/response-dto.decorator';

@Injectable()
export class SerializeV2Interceptor implements NestInterceptor {
  constructor(
    private storageService: StorageService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(switchMap((data) => from(this.responseHandler(data, context))));
  }

  private async responseHandler(
    apiResponse: ApiResponse<any>,
    context: ExecutionContext,
  ) {
    if (!(apiResponse instanceof ApiResponse)) {
      throw new Error('Response is not an instance of ApiResponse');
    }

    let data: any;
    if (apiResponse.data instanceof Pagination) {
      apiResponse.meta = {
        ...apiResponse.meta,
        pagination: apiResponse.data.meta,
      };
      data = apiResponse.data.items;
    } else {
      data = apiResponse.data;
    }

    apiResponse.data = await this.dataHandler(data, context);
    return apiResponse;
  }

  private async preSignUrlHandler(data: any, context: ExecutionContext) {
    const preSignedUrlObject = this.reflector.get<PreSignedUrlObject[]>(
      PRESIGNED_URL_METADATA,
      context.getHandler(),
    );

    if (preSignedUrlObject) {
      if (Array.isArray(data)) {
        await Promise.all(
          data.map((item) =>
            this.processPreSignedUrl(item, preSignedUrlObject),
          ),
        );
      } else {
        await this.processPreSignedUrl(data, preSignedUrlObject);
      }
    }
    return data;
  }

  private async processPreSignedUrl(
    item: any,
    preSignedUrlObject: PreSignedUrlObject[],
  ) {
    await Promise.all(
      preSignedUrlObject.map(async (preSignedUrl) => {
        await this.handlePreSignRecursively(
          item,
          preSignedUrl.originalKey.split('.'),
          preSignedUrl.urlKey.split('.'),
        );
      }),
    );
  }

  private async handlePreSignRecursively(
    data: any,
    originalKeys: string[],
    urlKeys: string[],
  ) {
    if (!data) return;

    if (Array.isArray(data)) {
      await Promise.all(
        data.map((item) =>
          this.handlePreSignRecursively(item, originalKeys, urlKeys),
        ),
      );
      return;
    }

    const currentKey = originalKeys[0];
    const currentUrlKey = urlKeys[0];
    const remainingOriginalKeys = originalKeys.slice(1);
    const remainingUrlKeys = urlKeys.slice(1);

    const value = data[currentKey];

    if (remainingOriginalKeys.length === 0) {
      // Leaf node: time to pre-sign
      if (!value) {
        data[currentUrlKey] = null;
        return;
      }

      let resolvedUrl: any = null;
      if (Array.isArray(value)) {
        resolvedUrl = await Promise.all(
          value.map((key) => this.storageService.getPreSignedUrl(key)),
        );
      } else if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',').map((p) => p.trim());
        resolvedUrl = await Promise.all(
          parts.map((key) => this.storageService.getPreSignedUrl(key)),
        );
      } else if (typeof value === 'string') {
        resolvedUrl = await this.storageService.getPreSignedUrl(value);
      }
      data[currentUrlKey] = resolvedUrl;
    } else {
      // Internal node: keep going
      await this.handlePreSignRecursively(
        value,
        remainingOriginalKeys,
        remainingUrlKeys,
      );
    }
  }

  private setNestedValue(obj: any, keys: string[], value: any) {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }


  private async dtoHandler(data: any, context: ExecutionContext) {
    const dto = this.reflector.get(DTO_METADATA, context.getHandler());
    if (dto) {
      return plainToInstance(dto, data, {
        excludeExtraneousValues: true,
      });
    }
    return data;
  }

  private async dataHandler(data: any, context: ExecutionContext) {
    const preSignedUrlData = await this.preSignUrlHandler(data, context);
    return this.dtoHandler(preSignedUrlData, context);
  }
}