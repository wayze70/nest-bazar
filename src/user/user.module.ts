import { Get, Module, Req } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
})
export class UserModule {}
