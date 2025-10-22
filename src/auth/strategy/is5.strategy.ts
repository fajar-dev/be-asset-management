import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Is5Strategy extends PassportStrategy(Strategy, 'is5') {
  constructor(
    private configService: ConfigService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { username, password } = req.body;

    try {
      const { data } = await axios.post(this.configService.getOrThrow('IS5_AUTH'), {
        username,
        password,
      });

      const payload: any = jwt.decode(data.token);

      const userIp =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip;

      const user = payload.user.user;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        isActive: user.isActive,
        branchId: user.branchId,
        departmentId: user.departmentId,
        ip: userIp,
      };
    } catch (error) {
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        'Invalid IS5 credentials';
      throw new UnauthorizedException(message);
    }
  }
}
