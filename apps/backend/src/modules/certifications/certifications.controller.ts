import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  // Récupérer les fournisseurs
  @Get('fournisseurs')
  async findAllFournisseurs() {
    return this.certificationsService.findAllFournisseurs();
  }

  // Récupérer un fournisseur par ID
  @Get('fournisseurs/:id')
  async findOneFournisseur(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findOneFournisseur(id);
  }

  // Créer un fournisseur
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('fournisseurs')
  async createFournisseur(@Body() dto: CreateFournisseurDto) {
    return this.certificationsService.createFournisseur(dto);
  }

  // Modifier un fournisseur
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch('fournisseurs/:id')
  async updateFournisseur(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFournisseurDto,
  ) {
    return this.certificationsService.updateFournisseur(id, dto);
  }

  // Supprimer un fournisseur
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('fournisseurs/:id')
  async removeFournisseur(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.removeFournisseur(id);
  }

  // Récupérer toutes les certifications
  @Get()
  async findAll() {
    return this.certificationsService.findAll();
  }

  // Récupérer une certification par son ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findOne(id);
  }

  // Créer une nouvelle certification
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post()
  async create(@Body() dto: CreateCertificationDto) {
    return this.certificationsService.create(dto);
  }

  // Mettre à jour les informations d'une certification
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCertificationDto,
  ) {
    return this.certificationsService.update(id, dto);
  }

  // Soft delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.remove(id);
  }

  // Récupérer les statistiques des examens de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('practice/stats')
  async getUserStats(@Req() req: any) {
    return this.certificationsService.getUserStats(req.user.id);
  }

  // Récupérer les questions d'une certification
  @UseGuards(JwtAuthGuard)
  @Get(':id/questions')
  async getQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findQuestions(id);
  }

  // Ajouter une question à une certification (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/questions')
  async createQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.certificationsService.createQuestion(id, dto);
  }

  // Enregistrer une tentative d'examen blanc
  @UseGuards(JwtAuthGuard)
  @Post(':id/tentatives')
  async createTentative(
    @Param('id', ParseIntPipe) id: number,
    @Body('score') score: number,
    @Req() req: any,
  ) {
    return this.certificationsService.createTentative(req.user.id, id, score);
  }

  // Supprimer une question (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('questions/:questionId')
  async removeQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.certificationsService.removeQuestion(questionId);
  }

  // Évaluer une réponse ouverte avec l'IA
  @UseGuards(JwtAuthGuard)
  @Post('evaluer-ia')
  async evaluateWithAi(
    @Body('questionId', ParseIntPipe) questionId: number,
    @Body('reponseCandidat') reponseCandidat: string,
  ) {
    return this.certificationsService.evaluateQuestionWithAi(questionId, reponseCandidat);
  }
}
