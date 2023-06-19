import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

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
    });

    return users;
  }
}
