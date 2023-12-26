import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Registrace
  async getAllUsers(): Promise<any> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        update_at: true,
        create_at: true,

        password_hash: false,
        refresh_token_hash: false,
      },
      orderBy: { id: 'asc' },
    });

    return users;
  }

  async updateLoginUser(sub: any, user: EditUserDto): Promise<any> {
    const updatedUser = await this.prisma.user.update({
      where: { id: sub },
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
      },
    });

    delete updatedUser.password_hash;
    delete updatedUser.refresh_token_hash;

    return updatedUser;
  }
}
