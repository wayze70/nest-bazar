import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards';
import { UserService } from './user.service';
import { EditUserDto } from 'src/user/dto';
import { chownSync } from 'fs';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    console.log(req);
    return req.user['user'];
  }

  @UseGuards(AccessTokenGuard)
  @Get('')
  async AllUsers() {
    const users = await this.userService.getAllUsers();
    return users;
  }

  @UseGuards(AccessTokenGuard)
  @Put('me')
  async updateLoginUser(@Req() req: Request, @Body() dto: EditUserDto) {
    console.log(req);
    const user = await this.userService.updateLoginUser(
      req.user['user'].sub,
      dto,
    );

    return user;
  }
}
