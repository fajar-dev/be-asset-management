import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Get,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../v1/user/entities/user.entity';
import { ResponseUserDto } from '../v1/user/dto/response-user.dto';
import { ApiResponse } from '../common/utils/ApiResponse';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { ResponseDto } from '../common/decorator/response-dto.decorator';
import { SerializeV2Interceptor } from '../common/interceptor/serialize-v2.interceptor';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ResponseDto(ResponseUserDto)
  @UseInterceptors(SerializeV2Interceptor)
  async getMe(@User() user: UserEntity) {
    return new ApiResponse('User fetched successfully', {
      ...user,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto, @Req() req: any) {
    return new ApiResponse(
      'User logged in successfully',
      await this.authService.login(loginRequestDto, req),
    );
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('refresh-token'))
  @HttpCode(HttpStatus.OK)
  async refresh(@User() user: UserEntity) {
    return {
      data: await this.authService.refresh(user),
    };
  }
}