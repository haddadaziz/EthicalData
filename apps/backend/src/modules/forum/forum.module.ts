import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ForumController],
  providers: [ForumService, PrismaService],
  exports: [ForumService],
})
export class ForumModule {}