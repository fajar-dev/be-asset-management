import { switchMap } from 'rxjs/operators';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '../utils/ApiResponse';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { DTO_METADATA } from '../decorator/response-dto.decorator';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

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

    apiResponse.data = this.dtoHandler(data, context);
    return apiResponse;
  }

  private dtoHandler(data: any, context: ExecutionContext) {
    const dto = this.reflector.get(DTO_METADATA, context.getHandler());
    if (dto) {
      return plainToInstance(dto, instanceToPlain(data), {
        excludeExtraneousValues: true,
      });
    }
    return data;
  }
}
