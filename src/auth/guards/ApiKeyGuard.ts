import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../v1/user/user.service';
import { IS_API_KEY_KEY } from '../../common/decorator/api-key.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorator/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const useApiKey = this.reflector.getAllAndOverride<boolean>(IS_API_KEY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If @UseApiKey() is not present, bypass this guard.
    if (!useApiKey) return true;

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (apiKey) {
      const user = await this.userService.findByApiKey(String(apiKey));
      if (user) {
        request.user = user;
        return true;
      }
    }

    // Check if the route is still public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // If not public and no valid API Key was found
    throw new UnauthorizedException('Missing or invalid API key');
  }
}
