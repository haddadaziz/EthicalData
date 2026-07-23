import { Module } from '@nestjs/common';
import { CoursController } from './cours.controller';
import { CoursService } from './cours.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoursController],
  providers: [CoursService],
  exports: [CoursService],
})
export class CoursModule {}
