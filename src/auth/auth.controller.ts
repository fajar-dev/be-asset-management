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
import { Public } from '../common/decorator/public.decorator';
import { Is5Guard } from './guards/is5.guard';

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
  @Public() 
  async login(@Body() loginRequestDto: LoginRequestDto, @Req() req: any) {
    return new ApiResponse(
      'User logged in successfully',
      await this.authService.login(loginRequestDto, req),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  @Public() 
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: any) {
    return new ApiResponse(
      'User logged in successfully',
      await this.authService.googleVerify(req.user),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('is5')
  @Public()
  @UseGuards(Is5Guard, AuthGuard('is5'))
  async is5Login(@Req() req: any) {
    return new ApiResponse(
      'User logged in successfully',
      await this.authService.is5Verify(req.user),
    );
  }


  @Post('refresh-token')
  @Public() 
  @UseGuards(AuthGuard('refresh-token'))
  @HttpCode(HttpStatus.OK)
  async refresh(@User() user: UserEntity) {
    return {
      data: await this.authService.refresh(user),
    };
  }
}