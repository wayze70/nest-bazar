import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Registrace
  async getAllUsers(): Promise<any> {
    const users = await this.prisma.user.findMany();
    return users;
  }
}
