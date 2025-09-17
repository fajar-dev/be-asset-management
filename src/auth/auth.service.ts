import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from '../v1/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto } from './dto/login-request.dto';
import { DateTime } from 'luxon';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate if the user exists and the password is correct
   *
   * @param email
   * @param password
   */
  public async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) return null;

    return user;
  }

  /**
   * Log the user in.
   *
   * @param loginRequestDto
   * @param req
   */
  public async login(loginRequestDto: LoginRequestDto, req: any) {
    const user = await this.validateUser(
      loginRequestDto.email,
      loginRequestDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Your password or email is incorrect');
    }

    user.lastLoginIp = req.headers['CF-Connecting-IP'] || req.ip;
    user.lastLoginAt = DateTime.now().toJSDate();
    await this.userRepository.save(user);

    return await this.responseWithToken(user);
  }

  /**
   * Refresh the access token.
   *
   * @param user
   */
  public async refresh(user: UserEntity) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  /**
   * Response with access and refresh token.
   *
   * @param user
   * @private
   */
  public async responseWithToken(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  /**
   * Generate a new refresh token.
   *
   * @param user
   * @private
   */
  private async generateRefreshToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * Generate a new access token.
   *
   * @param user
   * @private
   */
  private async generateAccessToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '2d',
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

}