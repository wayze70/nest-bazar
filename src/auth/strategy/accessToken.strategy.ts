import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    update_at: Date;
    create_at: Date;
  };
  iat: number;
  exp: number;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  prisma: any;
  constructor(config: ConfigService) {
    super({
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies['auth-cookie'];

          if (!token) {
            return null;
          }
          return token;
        },
      ]),
    });
  }

  validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
