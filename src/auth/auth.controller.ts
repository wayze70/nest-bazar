import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
  Response,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto, RegisterAuthDto } from './dto';
import { Request } from 'express';
import { AccessToken, Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { AtGuard, RtGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/signup
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  // signup(@Req() req: Request) { Problém je v tom, že pokud bychom chtěli změnit na jiný server než express, tak to nepůjde, jelikož Reqeust je z balíčku pro Express
  async signup(
    @Body() dto: RegisterAuthDto,
    @Res({ passthrough: true }) res,
  ): Promise<Tokens> {
    const tokens = await this.authService.signup(dto);

    res.cookie('auth-cookie', tokens.access_token, {
      expires: new Date(new Date().getTime() + 60 * 1000),
    }); // metoda neprojde, protože je httpOnly jinak funguje
    res.cookie('ref-cookie', tokens.refresh_token, {
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
      path: '/auth/refresh-token',
    });

    // Uloží se do cookie jako HttpOnly, následně je zapotřebí aby se každý request posílal v headru a já jej ověřoval
    // https://github.com/Naveen512/nestjs-jwt-cookie-auth/blob/master/src/users/users.controller.ts

    return tokens;
  }

  // POST /auth/signin
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: LoginAuthDto, @Res() res): Promise<Tokens> {
    const tokens = await this.authService.signin(dto);

    res.cookie('auth-cookie', tokens.access_token, {
      expires: new Date(new Date().getTime() + 60 * 1000),
    });
    res.cookie('ref-cookie', tokens.refresh_token, {
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
      path: '/auth/refresh-token',
    });

    return tokens;
  }

  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request): Promise<{ msg: string }> {
    const user = req.user;
    await this.authService.logout(user['sub']);
    return { msg: 'Success logout' };
  }

  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens(@Req() req: Request): Promise<AccessToken> {
    const user = req.user;
    const token = await this.authService.refreshTokens(
      user['sub'],
      user['token'],
    );
    return token;
  }
}