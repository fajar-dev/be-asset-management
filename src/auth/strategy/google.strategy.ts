import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private client: OAuth2Client;

  constructor(
    private configService: ConfigService,
  ) {
    super();
    this.client = new OAuth2Client(
      configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      'postmessage',
    );
  }

  async validate(req: any): Promise<any> {
    const code = req.body.code;
    if (!code) throw new Error('Missing Google auth code');

    const { tokens } = await this.client.getToken(code);

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const userIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip;

    return {
      googleId: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
      ip: userIp,
    };
  }
}
