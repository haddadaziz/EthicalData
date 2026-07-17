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
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  // ─── Admin: CRUD simulations ────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll() {
    return this.simulationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.simulationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateSimulationDto) {
    return this.simulationsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSimulationDto,
  ) {
    return this.simulationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.simulationsService.remove(id);
  }

  // ─── Questions par simulation (admin) ───────────────────────────

  @Get(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findQuestionsBySimulation(@Param('id', ParseIntPipe) id: number) {
    return this.simulationsService.findQuestionsBySimulation(id);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createSimulationQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.simulationsService.createSimulationQuestion(id, dto);
  }

  // ─── Questions par certification ─────────────────────────────────

  @Get('certifications/:certId/questions')
  @UseGuards(JwtAuthGuard)
  async findQuestionsByCertification(
    @Param('certId', ParseIntPipe) certId: number,
  ) {
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
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.simulationsService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
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
    return this.simulationsService.createTentative(
      req.user.id,
      certId,
      body.score,
    );
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

  // ─── Simulations de Cours ──────────────────────────────────────

  @Post('cours/:coursId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  async createCourseSimulation(
    @Param('coursId', ParseIntPipe) coursId: number,
    @Body() dto: CreateSimulationDto,
  ) {
    return this.simulationsService.createCourseSimulation(coursId, dto);
  }

  @Get('cours/:coursId')
  @UseGuards(JwtAuthGuard)
  async getCourseSimulation(@Param('coursId', ParseIntPipe) coursId: number) {
    return this.simulationsService.getCourseSimulation(coursId);
  }

  @Post('cours/:coursId/tentatives')
  @UseGuards(JwtAuthGuard)
  async createCourseTentative(
    @Req() req: any,
    @Param('coursId', ParseIntPipe) coursId: number,
    @Body() body: { score: number },
  ) {
    return this.simulationsService.createCourseTentative(
      req.user.id,
      coursId,
      body.score,
    );
  }

  @Get('cours/:coursId/readiness')
  @UseGuards(JwtAuthGuard)
  async getReadinessScoreForCourse(
    @Req() req: any,
    @Param('coursId', ParseIntPipe) coursId: number,
  ) {
    return this.simulationsService.getReadinessScoreForCourse(
      req.user.id,
      coursId,
    );
  }

  @Get('cours/:coursId/tentatives')
  @UseGuards(JwtAuthGuard)
  async getCourseTentatives(
    @Req() req: any,
    @Param('coursId', ParseIntPipe) coursId: number,
  ) {
    return this.simulationsService.getCourseTentatives(req.user.id, coursId);
  }

  @Get('cours/:coursId/questions')
  @UseGuards(JwtAuthGuard)
  async findCourseQuestions(@Param('coursId', ParseIntPipe) coursId: number) {
    return this.simulationsService.findQuestionsByCourse(coursId);
  }

  @Post('cours/:coursId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  async createCourseQuestion(
    @Param('coursId', ParseIntPipe) coursId: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.simulationsService.createCourseQuestion(coursId, dto);
  }
}
