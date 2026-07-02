import {
  Controller,
  Get,
  Post,
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

@Controller('forum')
@UseGuards(JwtAuthGuard) // Sécurise toutes les routes du forum par défaut
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  // 1. Récupérer toutes les discussions (avec filtres optionnels)
  @Get()
  async getSujets(
    @Query('theme') theme?: string,
    @Query('certificationId') certificationId?: string,
  ) {
    const certId = certificationId ? parseInt(certificationId) : undefined;
    return this.forumService.findAllSujets({ theme, certificationId: certId });
  }

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
    // req.user.roles est un tableau d'objets ou de chaînes selon l'auth, on extrait les noms de rôles
    const roles = req.user.roles ? req.user.roles.map((r: any) => typeof r === 'string' ? r : r.nom) : [];
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
    const roles = req.user.roles ? req.user.roles.map((r: any) => typeof r === 'string' ? r : r.nom) : [];
    return this.forumService.deleteCommentaire(req.user.id, roles, commentId);
  }
}