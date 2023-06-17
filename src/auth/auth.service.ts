import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAuthDto, RegisterAuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessToken, Tokens } from './types';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Registrace
  async signup(dto: RegisterAuthDto): Promise<Tokens> {
    const passwordHash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
        },
      });

      const tokens = await this.signTokens(user);
      await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      // catch error když nemaul už je taken a uživatel se pokouší založit účet se stejným emailem
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Creadentail taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: LoginAuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const pwMatches = await argon.verify(user.passwordHash, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const tokens = await this.signTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshTokenHash: {
          not: null,
        },
      },
      data: {
        refreshTokenHash: null,
      },
    });

    return true;
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AccessToken> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ForbiddenException('Refresh token access denied');

    const refreshTokenMatch = await argon.verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!refreshTokenMatch)
      throw new ForbiddenException('Refresh token access denied');

    const accessToken = await this.signAccessToken(user); // TODO: Nutné rozhovnout, zda se bude při každém novém generovaném access tokenu také generovat nový refresh token
    // await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return accessToken;
  }

  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: hash,
      },
    });
  }

  async signAccessToken(user: User): Promise<AccessToken> {
    const accessSecret = this.config.get('JWT_SECRET');

    delete user.passwordHash;
    delete user.refreshTokenHash;

    const [accessToken] = await Promise.all([
      this.jwt.signAsync(
        {
          user,
        },
        {
          secret: accessSecret,
          expiresIn: 60,
        },
      ),
    ]);

    return {
      access_token: accessToken,
    };
  }

  async signTokens(user: User): Promise<Tokens> {
    const accessSecret = this.config.get('JWT_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');

    delete user.passwordHash;
    delete user.refreshTokenHash;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          user,
        },
        {
          secret: accessSecret,
          expiresIn: 60,
        },
      ),
      this.jwt.signAsync(
        {
          sub: user.id,
        },
        {
          secret: refreshSecret,
          expiresIn: 60 * 15,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /* async signToken(
    userId: Object,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return { access_token: token };
  }*/
}
