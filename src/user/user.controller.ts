import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AtGuard } from 'src/common/guards';

@Controller('users')
export class UserController {
  @UseGuards(AtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AtGuard)
  @Get('')
  getAllUsers(@Req() req: Request) {
    return req.user;
  }
}
