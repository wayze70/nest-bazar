import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies['ref-cookie'];

          if (!token) {
            return null;
          }
          return token;
        },
      ]),
    });
  }

  validate(req: Request, payload: any) {
    /* const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();
    console.log({payload});*/

    const token = req?.cookies['ref-cookie'];

    if (!token) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      token,
    };
  }
}
