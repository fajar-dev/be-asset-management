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
        const keys = preSignedUrl.originalKey.split('.');
        const urlKeys = preSignedUrl.urlKey.split('.');
        
        let path = item;
        for (let i = 0; i < keys.length; i++) {
          path = path ? path[keys[i]] : null;
        }

        if (!path) {
          this.setNestedValue(item, urlKeys, null);
          return;
        }

        let resolvedUrl: any = null;
        // case: array
        if (Array.isArray(path)) {
          resolvedUrl = await Promise.all(
            path.map((key) => this.storageService.getPreSignedUrl(key)),
          );
        }
        // case: comma separated string
        else if (typeof path === 'string' && path.includes(',')) {
          const parts = path.split(',').map((p) => p.trim());
          resolvedUrl = await Promise.all(
            parts.map((key) => this.storageService.getPreSignedUrl(key)),
          );
        }
        // case: single string
        else if (typeof path === 'string') {
          resolvedUrl = await this.storageService.getPreSignedUrl(path);
        }

        this.setNestedValue(item, urlKeys, resolvedUrl);
      }),
    );
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