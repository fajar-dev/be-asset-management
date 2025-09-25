import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../v1/user/user.module';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { User } from '../v1/user/entities/user.entity';
import { GoogleStrategy } from './strategy/google.strategy';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({}),
    UserModule,
    StorageModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
