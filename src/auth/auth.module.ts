import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from './strategy';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  // import z prisma, kde musí být export
  // imports: [PrismaModule], uděláme globální modul, který nemusíme všude importovat
  controllers: [AuthController],
  providers: [AuthService /* JwtStrategy*/, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
