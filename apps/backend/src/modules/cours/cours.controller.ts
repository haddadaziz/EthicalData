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
} from '@nestjs/common';
import { CoursService } from './cours.service';
import { CreateCoursDto } from './dto/create-cours.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateModuleRessourceDto } from './dto/create-module-ressource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cours')
@UseGuards(JwtAuthGuard)
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  // ─────────────────────────────────────────
  // COURS
  // ─────────────────────────────────────────

  // Tous les cours du formateur connecté
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Get('mes-cours')
  async getMesCours(@Req() req: any) {
    return this.coursService.findAllByFormateur(req.user.id);
  }

  // Brouillons du formateur connecté
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Get('mes-brouillons')
  async getMesBrouillons(@Req() req: any) {
    return this.coursService.findBrouillons(req.user.id);
  }

  // Tous les cours publiés (pour les apprenants)
  @Get()
  async getAllPublished() {
    return this.coursService.findAllPublished();
  }

  // Cours publiés sans ceux du formateur connecté
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Get('disponibles')
  async getDisponibles(@Req() req: any) {
    return this.coursService.findDisponibles(req.user.id);
  }

  // Mes inscriptions
  @Get('mes-inscriptions')
  async getMyInscriptions(@Req() req: any) {
    return this.coursService.findMyInscriptions(req.user.id);
  }

  // Détail d'un cours
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursService.findOne(id);
  }

  // Créer un cours (brouillon par défaut)
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCoursDto) {
    return this.coursService.create(req.user.id, dto);
  }

  // Mettre à jour un cours
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCoursDto>,
  ) {
    return this.coursService.update(req.user.id, id, dto);
  }

  // Publier un cours
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/publier')
  async publish(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.publish(req.user.id, id);
  }

  // Supprimer un cours (soft delete)
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.remove(req.user.id, id);
  }

  // ─────────────────────────────────────────
  // MODULES D'UN COURS
  // ─────────────────────────────────────────

  // Ajouter un module à un cours
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Post(':coursId/modules')
  async addModule(
    @Req() req: any,
    @Param('coursId', ParseIntPipe) coursId: number,
    @Body() dto: CreateModuleDto,
  ) {
    return this.coursService.addModule(req.user.id, coursId, dto);
  }

  // Modifier un module
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Patch('modules/:moduleId')
  async updateModule(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: Partial<CreateModuleDto>,
  ) {
    return this.coursService.updateModule(req.user.id, moduleId, dto);
  }

  // Supprimer un module
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Delete('modules/:moduleId')
  async removeModule(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.coursService.removeModule(req.user.id, moduleId);
  }

  // ─────────────────────────────────────────
  // RESSOURCES D'UN MODULE
  // ─────────────────────────────────────────

  // Ajouter une ressource à un module
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Post('modules/:moduleId/ressources')
  async addRessource(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: CreateModuleRessourceDto,
  ) {
    return this.coursService.addRessource(req.user.id, moduleId, dto);
  }

  // Supprimer une ressource
  @UseGuards(RolesGuard)
  @Roles('FORMATEUR', 'ADMIN', 'SUPER_ADMIN')
  @Delete('ressources/:ressourceId')
  async removeRessource(
    @Req() req: any,
    @Param('ressourceId', ParseIntPipe) ressourceId: number,
  ) {
    return this.coursService.removeRessource(req.user.id, ressourceId);
  }

  // ─────────────────────────────────────────
  // INSCRIPTIONS APPRENANTS
  // ─────────────────────────────────────────

  // S'inscrire à un cours
  @Post(':id/inscrire')
  async inscrire(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.inscrire(req.user.id, id);
  }

  // Se désinscrire d'un cours
  @Delete(':id/inscrire')
  async desinscrire(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.desinscrire(req.user.id, id);
  }

  // Progression des modules d'un cours
  @Get(':id/modules/progression')
  async getProgressionModules(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.getProgressionModules(req.user.id, id);
  }

  // Marquer un module comme complété
  @Post(':id/modules/:moduleId/complete')
  async completeModule(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.coursService.completeModule(req.user.id, id, moduleId);
  }
}