import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Globální export, který bude dostupný všude
@Module({
  providers: [PrismaService],

  // Pokud chceme importovat do auth module, tak tady musí být export
  exports: [PrismaService],
})
export class PrismaModule {}
