import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AtGuard } from 'src/common/guards';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user['user'];
  }

  @UseGuards(AtGuard)
  @Get('')
  async AllUsers() {
    const users = await this.userService.getAllUsers();
    return users;
  }
}
