import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateSujetDto } from './dto/create-sujet.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('forum')
@UseGuards(JwtAuthGuard) // Sécurise toutes les routes du forum par défaut
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // 1. Récupérer toutes les discussions (avec filtres optionnels)
  @Get()
  async getSujets(
    @Req() req: any,
    @Query('theme') theme?: string,
    @Query('certificationId') certificationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const certId = certificationId ? parseInt(certificationId) : undefined;
    const userId = req.user?.id ? Number(req.user.id) : undefined;
    return this.forumService.findAllSujets({
      theme,
      certificationId: certId,
      userId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ==========================================
  // ROUTES ADMIN & MODÉRATION (Placées AVANT :id)
  // ==========================================

  // Récupérer les statistiques globales du forum
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/stats')
  async getAdminStats() {
    return this.forumService.getAdminStats();
  }

  // Récupérer les signalements (filtrés par statut traite)
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/signalements')
  async getReportedSujets(@Query('traite') traite?: string) {
    const isTraite = traite === 'true';
    return this.forumService.getReportedSujets(isTraite);
  }

  // Marquer un signalement comme résolu
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('admin/signalements/:id/traiter')
  async resolveSignalement(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.forumService.resolveSignalement(id, type);
  }

  // Annuler / remettre un signalement en attente
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('admin/signalements/:id/annuler')
  async unresolveSignalement(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.forumService.unresolveSignalement(id, type);
  }

  // ==========================================
  // ROUTES AVEC PARAMÈTRES ET ACTIONS USERS
  // ==========================================

  // 2. Créer une nouvelle publication
  @Post()
  async createSujet(@Req() req: any, @Body() dto: CreateSujetDto) {
    return this.forumService.createSujet(req.user.id, dto);
  }

  // 3. Récupérer le détail d'un sujet et ses commentaires
  @Get(':id')
  async getOneSujet(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.forumService.findOneSujet(id, req.user.id);
  }

  // 4. Liker ou enlever un like sur un sujet (Toggle)
  @Post(':id/like')
  async toggleLike(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.forumService.toggleLikeSujet(req.user.id, id);
  }

  // 5. Signaler un sujet à la modération
  @Post(':id/signaler')
  async reportSujet(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body('motif') motif?: string,
  ) {
    return this.forumService.reportSujet(req.user.id, id, motif);
  }

  // 6. Supprimer un sujet (Auteur ou Admin uniquement)
  @Delete(':id')
  async deleteSujet(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const roles = req.user.roles
      ? req.user.roles.map((r: any) => (typeof r === 'string' ? r : r.nom))
      : [];
    return this.forumService.deleteSujet(req.user.id, roles, id);
  }

  // 7. Ajouter un commentaire
  @Post(':id/commentaires')
  async addCommentaire(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: CreateCommentaireDto,
  ) {
    return this.forumService.createCommentaire(req.user.id, id, dto);
  }

  // 8. Supprimer un commentaire (Auteur ou Admin uniquement)
  @Delete('commentaires/:commentId')
  async deleteCommentaire(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ) {
    const roles = req.user.roles
      ? req.user.roles.map((r: any) => (typeof r === 'string' ? r : r.nom))
      : [];
    return this.forumService.deleteCommentaire(req.user.id, roles, commentId);
  }

  // 9. Liker ou enlever un like sur un commentaire (Toggle)
  @Post('commentaires/:commentId/like')
  async toggleLikeCommentaire(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ) {
    return this.forumService.toggleLikeCommentaire(req.user.id, commentId);
  }

  // 10. Signaler un commentaire à la modération
  @Post('commentaires/:commentId/signaler')
  async reportCommentaire(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
    @Body('motif') motif?: string,
  ) {
    return this.forumService.reportCommentaire(req.user.id, commentId, motif);
  }
}
