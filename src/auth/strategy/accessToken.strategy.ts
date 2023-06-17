import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt' /* Výchozí hodnota je jwt, nemusí se tma psát, ale pro přehlednost */,
) {
  prisma: any;
  constructor(config: ConfigService) {
    super({
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = request?.cookies['auth-cookie'];

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

    // req.user = payload;
  }
}
