import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { AiService } from '../certifications/ai.service';

@Module({
    controllers: [SimulationsController],
    providers: [SimulationsService, AiService],
    exports: [SimulationsService],
})
export class SimulationsModule { }