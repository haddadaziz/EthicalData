import { Module } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CertificationsController } from './certifications.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [CertificationsController],
  providers: [CertificationsService, AiService],
})
export class CertificationsModule {}
