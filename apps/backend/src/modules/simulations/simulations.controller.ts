import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('simulations')
export class SimulationsController {
    constructor(private readonly simulationsService: SimulationsService) { }

    @Get('certifications/:certId/questions')
    async findQuestionsByCertification(@Param('certId', ParseIntPipe) certId: number) {
        return this.simulationsService.findQuestionsByCertification(certId);
    }

    @Post('certifications/:certId/questions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    async createQuestion(
        @Param('certId', ParseIntPipe) certId: number,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.simulationsService.createQuestion(certId, dto);
    }

    @Patch('questions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    async updateQuestion(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.simulationsService.updateQuestion(id, dto);
    }

    @Delete('questions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    async removeQuestion(@Param('id', ParseIntPipe) id: number) {
        return this.simulationsService.removeQuestion(id);
    }

    @Post('evaluer-ia')
    @UseGuards(JwtAuthGuard)
    async evaluateQuestionWithAi(
        @Body() body: { questionId: number; reponseCandidat: string },
    ) {
        return this.simulationsService.evaluateQuestionWithAi(
            body.questionId,
            body.reponseCandidat,
        );
    }

    @Post('certifications/:certId/tentatives')
    @UseGuards(JwtAuthGuard)
    async createTentative(
        @Req() req: any,
        @Param('certId', ParseIntPipe) certId: number,
        @Body() body: { score: number },
    ) {
        return this.simulationsService.createTentative(req.user.id, certId, body.score);
    }

    @Get('me/stats')
    @UseGuards(JwtAuthGuard)
    async getUserStats(@Req() req: any) {
        return this.simulationsService.getUserStats(req.user.id);
    }

    @Get('certifications/:certId/readiness')
    @UseGuards(JwtAuthGuard)
    async getReadinessScoreForCertification(
        @Req() req: any,
        @Param('certId', ParseIntPipe) certId: number,
    ) {
        return this.simulationsService.getReadinessScoreForCertification(
            req.user.id,
            certId,
        );
    }
}