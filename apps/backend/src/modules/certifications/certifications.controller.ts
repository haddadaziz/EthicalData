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
  UseInterceptors,
  Req,
  Request,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CertificationsService } from './certifications.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { CreateModuleCertificationDto } from './dto/create-module-certification.dto';
import { UpdateModuleCertificationDto } from './dto/update-module-certification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('certifications')
@UseInterceptors(CacheInterceptor)
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

  // ==========================================
  // ROUTES CATEGORIES
  // ==========================================

  @Get('categories')
  async findAllCategories() {
    return this.certificationsService.findAllCategories();
  }

  @Get('categories/:id')
  async findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findOneCategory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('categories')
  async createCategory(@Body() dto: CreateCategorieDto) {
    return this.certificationsService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategorieDto,
  ) {
    return this.certificationsService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('categories/:id')
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.removeCategory(id);
  }

  // ==========================================
  // ROUTES CERTIFICATIONS
  // ==========================================

  // Récupérer toutes les certifications
  @Get()
  async findAll(@Req() req: any) {
    const categorieSlug = req.query?.categorie as string | undefined;
    return this.certificationsService.findAll(categorieSlug);
  }

  // Récupérer une certification par son slug (pour le frontend public)
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.certificationsService.findBySlug(slug);
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

  // ==========================================
  // ROUTES MODULES DE CERTIFICATION
  // ==========================================

  @Get(':id/modules')
  async findModules(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findModules(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/modules')
  async createModule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateModuleCertificationDto,
  ) {
    return this.certificationsService.createModule(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('modules/:moduleId')
  async updateModule(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: UpdateModuleCertificationDto,
  ) {
    return this.certificationsService.updateModule(moduleId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('modules/:moduleId')
  async removeModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.certificationsService.removeModule(moduleId);
  }

  // ==========================================
  // ROUTES QUESTIONS / STATS
  // ==========================================

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

  // Modifier une question (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('questions/:questionId')
  async updateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.certificationsService.updateQuestion(questionId, dto);
  }

  // Évaluer une réponse ouverte avec l'IA
  @UseGuards(JwtAuthGuard)
  @Post('evaluer-ia')
  async evaluateWithAi(
    @Body() body: { questionId: number | string; reponseCandidat?: string },
  ) {
    const questionId = Number(body?.questionId);
    return this.certificationsService.evaluateQuestionWithAi(
      questionId,
      body?.reponseCandidat || '',
    );
  }

  // ==========================================
  // ROUTES GESTION DES RESSOURCES
  // ==========================================

  // Récupérer toutes les ressources (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('ressources/toutes')
  async findAllRessources() {
    return this.certificationsService.findAllRessources();
  }

  // Créer une ressource liée à une certification (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post(':id/ressources')
  async createRessource(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRessourceDto,
  ) {
    dto.certificationId = id;
    return this.certificationsService.createRessource(dto);
  }

  // Modifier une ressource (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('ressources/:resourceId')
  async updateRessource(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Body() dto: Partial<CreateRessourceDto>,
  ) {
    return this.certificationsService.updateRessource(resourceId, dto);
  }

  // Supprimer une ressource (réservé aux admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('ressources/:resourceId')
  async removeRessource(@Param('resourceId', ParseIntPipe) resourceId: number) {
    return this.certificationsService.removeRessource(resourceId);
  }
  // Récupérer les quotas de téléchargement de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('ressources/mes-quotas')
  async getMyQuotas(@Req() req: any) {
    return this.certificationsService.getUserResourceQuotas(req.user.id);
  }

  // S'inscrire à une certification
  @UseGuards(JwtAuthGuard)
  @Post(':id/inscrire')
  async enrollCertification(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.certificationsService.enrollUser(req.user.id, id);
  }

  // Désinscrire d'une certification
  @UseGuards(JwtAuthGuard)
  @Delete(':id/inscrire')
  async unenrollCertification(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.certificationsService.unenrollUser(req.user.id, id);
  }

  // Récupérer les inscriptions de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('mes-inscriptions')
  async getMyEnrollments(@Req() req: any) {
    return this.certificationsService.getUserEnrollments(req.user.id);
  }

  // Demande de téléchargement sécurisée pour un document
  @UseGuards(JwtAuthGuard)
  @Post('ressources/:resourceId/telecharger')
  async downloadFile(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    return this.certificationsService.downloadRessource(
      req.user.id,
      resourceId,
      ip,
    );
  }
}
