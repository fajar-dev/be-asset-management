import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { customValidationPipe } from 'src/common/pipes/validation.pipe';
import { Is5LoginRequestDto } from '../dto/is5-login-request.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class Is5Guard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const dto = plainToInstance(Is5LoginRequestDto, request.body);

    const pipe = customValidationPipe();
    await pipe.transform(dto, {
      type: 'body',
      metatype: Is5LoginRequestDto,
    });

    return true;
  }
}
