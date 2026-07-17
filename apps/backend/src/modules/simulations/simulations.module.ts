import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { AiService } from '../certifications/ai.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [SimulationsController],
  providers: [SimulationsService, AiService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
