import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 0. Envoyer une notification à un groupe (SUPER_ADMIN uniquement)
  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async sendToGroup(
    @Body()
    dto: {
      titre: string;
      message: string;
      target: string;
      type?: string;
      lien?: string;
    },
  ) {
    return this.notificationsService.sendToGroup({
      titre: dto.titre,
      message: dto.message,
      target: dto.target as 'FORMATEUR' | 'APPRENANT' | 'TOUS',
      type: dto.type || 'SYSTEM',
      lien: dto.lien,
    });
  }

  // 1. Récupérer les notifications et le nombre d'éléments non lus
  @Get()
  async getNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  // 2. Marquer TOUTES les notifications comme lues (placé avant :id)
  @Patch('tout-lire')
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // 3. Marquer une notification spécifique comme lue
  @Patch(':id/lire')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  // 4. Supprimer une notification
  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.notificationsService.deleteNotification(req.user.id, id);
  }
}
